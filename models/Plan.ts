/* =========================================================
   PLAN MODULE – MONGOOSE SCHEMA
   File: Plan.ts
   ========================================================= */

import mongoose, { Schema, Document, Types } from 'mongoose';

/* ---------- Common Types ---------- */

export type UUID = Types.ObjectId;

/* ---------- Enums ---------- */

export enum PlanFileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

export enum AnnotationType {
  PIN = 'PIN',
  TEXT = 'TEXT',
  FREE_DRAW = 'FREE_DRAW',
  CIRCLE = 'CIRCLE',
  LINK = 'LINK'
  // future types can be added without schema change
}

/* ---------- Interfaces ---------- */

export interface Position {
  x: number; // 0–100 (percentage)
  y: number; // 0–100
}

export interface BaseAnnotation {
  _id: UUID;
  type: AnnotationType;

  position: Position;

  payload: Record<string, any>; // extensible payload

  createdBy: UUID;
  createdAt: Date;
  updatedAt?: Date;

  isDeleted?: boolean;
}

export interface PlanVersion {
  _id: UUID;
  versionNumber: number;

  annotations: BaseAnnotation[];

  createdBy: UUID;
  createdAt: Date;

  comment?: string;
}

export interface PlanDocument extends Document {
  projectId: UUID;

  name: string;
  fileUrl: string;
  fileType: PlanFileType;

  versions: PlanVersion[];
  currentVersion: number;

  uploadedBy: UUID;
  uploadedAt: Date;

  isArchived?: boolean;
}

/* =========================================================
   SCHEMAS
   ========================================================= */

/* ---------- Position Schema ---------- */
const PositionSchema = new Schema<Position>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

/* ---------- Annotation Schema (Single, Generic) ---------- */
const AnnotationSchema = new Schema<BaseAnnotation>(
  {
    type: {
      type: String,
      enum: Object.values(AnnotationType),
      required: true
    },

    position: {
      type: PositionSchema,
      required: true
    },

    payload: {
      type: Schema.Types.Mixed, // flexible for future annotations
      required: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

/* ---------- Plan Version Schema ---------- */
const PlanVersionSchema = new Schema<PlanVersion>(
  {
    versionNumber: {
      type: Number,
      required: true
    },

    annotations: {
      type: [AnnotationSchema],
      default: []
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    comment: {
      type: String
    }
  },
  { _id: true }
);

/* ---------- Plan Schema ---------- */
const PlanSchema = new Schema<PlanDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    name: {
      type: String,
      required: true
    },

    fileUrl: {
      type: String,
      
    },

    fileType: {
      type: String,
    },

    versions: {
      type: [PlanVersionSchema],
      default: []
    },

    currentVersion: {
      type: Number,
      default: 1
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: false
  }
);

/* ---------- Model ---------- */
export default  mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);
