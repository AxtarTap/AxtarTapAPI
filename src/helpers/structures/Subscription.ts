
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

    constructor(data: { _id: ObjectId, configurations: SubscriptionConfigurations, benefits: SubscriptionBenefits }) {
        const { _id, configurations, benefits } = data;
        this.id = _id;
        this.configurations = configurations;
        this.benefits = benefits;
    }
}