import { Schema, model } from "mongoose";
import { Subscription } from "types/subscribtionTypes";
import { CustomerType } from "./customers";

export interface SubscriptionType {
    subscription: Subscription;
    customer: Schema.Types.ObjectId;
}

export const SubscriptionSchema = new Schema<SubscriptionType>({
    subscription: {
        configurations: {
            name: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            postPerDay: { type: Number, required: true },
            price: { type: Number, required: true }
        },
        benefits: {
            credit: { type: Number, required: true },
            likeCount: { type: Number, required: true },
            saveCount: { type: Number, required: true },
            commentCount: { type: Number, required: true }
        }
    },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true }
});

export const SubscriptionModel = model<SubscriptionType>("Subscription", SubscriptionSchema);

// Functions
export const getSubscriptionByCustomerId = async (customerId: string) => {
    return await SubscriptionModel.findOne({ customer: customerId });
};
export const getCustomerBySubscriptionId = async (subscriptionId: string) => {
    return await SubscriptionModel.findById(subscriptionId).populate("customer");
}
export const createSubscription = async (values: Record<string, any>) => {
    return await new SubscriptionModel(values).save().then((subscription: any) => subscription.toObject());
};
export const findOrCreateSubscription = async (values: Record<string, any>) => {
    return await SubscriptionModel.findOne(values).then(async (subscription: any) => {
        if (subscription) {
            return subscription;
        }
        return await createSubscription(values);
    });
};
export const deleteSubscriptionById = async (id: string) => {
    return await SubscriptionModel.findByIdAndDelete(id);
}
export const deleteSubscriptionByCustomerId = async (id: string) => {
    return await SubscriptionModel.findOneAndDelete({ customer: id });
};
export const updateSubscriptionById = async (id: string, values: Record<string, any>) => {
    return await SubscriptionModel.findByIdAndUpdate(id, values);
}
export const updateSubscriptionByCustomerId = async (id: string, values: Record<string, any>) => {
    return await SubscriptionModel.findOneAndUpdate({ customer: id }, values);
}