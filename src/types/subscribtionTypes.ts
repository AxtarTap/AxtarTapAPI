import { ObjectId } from "mongoose";

export interface Subscription {
    configurations: SubscriptionConfigurations;
    benefits: SubscriptionBenefits;
}

export interface SubscriptionConfigurations {
    name: string;
    title: string;
    description: string;
    postPerDay: number;
    price: number;
}

export interface SubscriptionBenefits {
    credit: number;
    likeCount: number;
    saveCount: number;
    commentCount: number;
}

export type SubscriptionTypes = {
    'standard': Subscription,
    'pro': Subscription,
    'enterprise': Subscription,
}   

export interface SubscriptionRequestPayload {
    tier: keyof SubscriptionTypes;
}