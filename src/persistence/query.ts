import { defaultPageSize } from "../constants";

export enum Operator {
    equals,
    contains
}

export enum OrderDirection {
    accending,
    descending
}

export interface Filter<TLeftOperand, TRightOperand> {
    left: TLeftOperand;
    operator: Operator;
    right: TRightOperand;
}

export class Query<T> {
    public filters: Filter<any, any>[] = [];
    public skipping: number = 0;
    public taking: number = defaultPageSize;
    public selecting: string;
    public orderingBy: string;
    public orderDirection: OrderDirection;

    constructor() {
        this.orderDirection = OrderDirection.accending;
    }

    public where<TLeftOperand, TRightOperand>(left: TLeftOperand, operator: Operator, right: TRightOperand): Query<T> {
        this.filters.push({ left, operator, right });
        return this;
    }

    public skip(itemsToSkip: number): Query<T> {
        this.skipping = itemsToSkip;
        return this;
    }

    public take(itemsToTake: number): Query<T> {
        this.taking = itemsToTake;
        return this;
    }

    public orderBy(property: string): Query<T> {
        this.orderingBy = property;
        this.orderDirection = OrderDirection.accending;
        return this;
    }

    public orderByDesc(property: string): Query<T> {
        this.orderingBy = property;
        this.orderDirection = OrderDirection.descending;
        return this;
    }

    public static from<T>(): Query<T> {
        return new Query<T>();
    }

    public getNextPageQuery<T>(): Query<T> {
        const nextPageQuery = this.copy();
        nextPageQuery.skipping = this.skipping + this.taking;

        return nextPageQuery;
    }

    public getPrevPageQuery<T>(): Query<T> {
        const prevPageQuery = this.copy();

        let skip = this.skipping - this.taking;

        if (skip < 0) {
            skip = undefined;
        }

        prevPageQuery.skipping = skip;

        return prevPageQuery;
    }

    public copy<T>(): Query<T> {
        const query = new Query<T>();
        query.filters = this.filters;
        query.selecting = this.selecting;
        query.orderingBy = this.orderingBy;
        query.orderDirection = this.orderDirection;
        query.taking = this.taking;
        query.skipping = this.skipping;

        return query;
    }
}

export interface Page<T> {
    value: T[];
    prevPage?: Query<T>;
    nextPage?: Query<T>;

    takePrev?(numberOfRecords?: number): Promise<Page<T>>;
    takeNext?(numberOfRecords?: number): Promise<Page<T>>;
}