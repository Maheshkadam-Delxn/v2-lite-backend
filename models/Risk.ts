import mongoose, { Schema, Document } from "mongoose";

export interface IRisk extends Document {
    projectId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category?: 'Safety' | 'Financial' | 'Timeline' | 'Quality';
    severity?: 'Low' | 'Medium' | 'High' | 'Critical';
    likelihood?: number; // 1-5
    impact?: number; // 1-5
    score?: number; // Calculated
    status: 'Open' | 'Mitigating' | 'Pending Review' | 'Resolved';
    date: Date;
    assignedTo?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    evidence?: string | object;
    resolutionNotes?: string;
}

const RiskSchema = new Schema<IRisk>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            enum: ['Safety', 'Financial', 'Timeline', 'Quality'],
        },
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
        },
        likelihood: {
            type: Number,
            min: 1,
            max: 5,
        },
        impact: {
            type: Number,
            min: 1,
            max: 5,
        },
        score: {
            type: Number,
            min: 1,
            max: 25,
        },
        status: {
            type: String,
            enum: ['Open', 'Mitigating', 'Pending Review', 'Resolved'],
            default: 'Open',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        evidence: {
            type: Schema.Types.Mixed, // URL String or Object
        },
        resolutionNotes: {
            type: String,
        },
    },
    { timestamps: true }
);

// Pre-save hook to calculate score
RiskSchema.pre("save", function (next) {
    if (this.likelihood && this.impact) {
        this.score = this.likelihood * this.impact;
    }
    next();
});

export default mongoose.models.Risk || mongoose.model<IRisk>("Risk", RiskSchema);
