
import { ObjectId } from 'mongoose';
import { Subscription as Payload, SubscriptionBenefits, SubscriptionConfigurations } from '../../types/subscribtionTypes';

export default class Subscription implements Payload {
    public id: ObjectId;
    public configurations: {
        name: string;
        title: string;
        description: string;
        price: number;
        postPerDay: number;
    };
    public benefits: {
        credit: number;
        likeCount: number;
        saveCount: number;
        commentCount: number;
    };
    public createdTimestamp: Date;
    
    constructor(data: { _id: ObjectId, configurations: SubscriptionConfigurations, benefits: SubscriptionBenefits, createdDate: Date }) {
        const { _id, configurations, benefits, createdDate } = data;
        this.id = _id;
        this.configurations = configurations;
        this.benefits = benefits;
        this.createdTimestamp = createdDate;
    }

    public get createdAt() {
        return this.createdTimestamp ? new Date(this.createdTimestamp) : undefined
    }
    public test() {
        console.log('test')
    }
}