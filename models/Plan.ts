
// // import mongoose, { Schema, Document, Types } from 'mongoose';

// // /* ---------- Common Types ---------- */

// // export type UUID = Types.ObjectId;

// // /* ---------- Enums ---------- */

// // export enum PlanFileType {
// //   IMAGE = 'IMAGE',
// //   PDF = 'PDF'
// // }

// // export enum AnnotationType {
// //   PIN = 'PIN',
// //   TEXT = 'TEXT',
// //   FREE_DRAW = 'FREE_DRAW',
// //   CIRCLE = 'CIRCLE',
// //   LINK = 'LINK'
// //   // future types can be added without schema change
// // }

// // /* ---------- Interfaces ---------- */

// // export interface Position {
// //   x: number; // 0–100 (percentage)
// //   y: number; // 0–100
// // }

// // export interface BaseAnnotation {
// //   _id: UUID;
// //   type: AnnotationType;

// //   position: Position;

// //   payload: Record<string, any>; // extensible payload

// //   createdBy: UUID;
// //   createdAt: Date;
// //   updatedAt?: Date;

// //   isDeleted?: boolean;
// // }

// // export interface PlanVersion {
// //   _id: UUID;
// //   versionNumber: number;

// //   annotations: BaseAnnotation[];

// //   createdBy: UUID;
// //   createdAt: Date;

// //   comment?: string;
// // }

// // export interface PlanDocument extends Document {
// //   projectId: UUID;

// //   name: string;
// //   fileUrl: string;
// //   fileType: PlanFileType;

// //   versions: PlanVersion[];
// //   currentVersion: number;

// //   uploadedBy: UUID;
// //   uploadedAt: Date;

// //   isArchived?: boolean;
// // }

// // /* =========================================================
// //    SCHEMAS
// //    ========================================================= */

// // /* ---------- Position Schema ---------- */
// // const PositionSchema = new Schema<Position>(
// //   {
// //     x: { type: Number, required: true },
// //     y: { type: Number, required: true }
// //   },
// //   { _id: false }
// // );

// // /* ---------- Annotation Schema (Single, Generic) ---------- */
// // const AnnotationSchema = new Schema<BaseAnnotation>(
// //   {
// //     type: {
// //       type: String,
// //       enum: Object.values(AnnotationType),
// //       required: true
// //     },

// //     position: {
// //       type: PositionSchema,
// //       required: true
// //     },

// //     payload: {
// //       type: Schema.Types.Mixed, // flexible for future annotations
// //       required: true
// //     },

// //     createdBy: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },

// //     createdAt: {
// //       type: Date,
// //       default: Date.now
// //     },

// //     updatedAt: {
// //       type: Date
// //     },

// //     isDeleted: {
// //       type: Boolean,
// //       default: false
// //     }
// //   },
// //   { _id: true }
// // );

// // /* ---------- Plan Version Schema ---------- */
// // const PlanVersionSchema = new Schema<PlanVersion>(
// //   {
// //     versionNumber: {
// //       type: Number,
// //       required: true
// //     },

// //     annotations: {
// //       type: [AnnotationSchema],
// //       default: []
// //     },

// //     createdBy: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },

// //     createdAt: {
// //       type: Date,
// //       default: Date.now
// //     },

// //     comment: {
// //       type: String
// //     }
// //   },
// //   { _id: true }
// // );

// // /* ---------- Plan Schema ---------- */
// // const PlanSchema = new Schema<PlanDocument>(
// //   {
// //     projectId: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'Project',
// //       required: true
// //     },

// //     name: {
// //       type: String,
// //       required: true
// //     },

// //     fileUrl: {
// //       type: String,
      
// //     },

// //     fileType: {
// //       type: String,
// //     },

// //     versions: {
// //       type: [PlanVersionSchema],
// //       default: []
// //     },

// //     currentVersion: {
// //       type: Number,
// //       default: 1
// //     },

// //     uploadedBy: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },

// //     uploadedAt: {
// //       type: Date,
// //       default: Date.now
// //     },

// //     isArchived: {
// //       type: Boolean,
// //       default: false
// //     }
// //   },
// //   {
// //     timestamps: false
// //   }
// // );

// // /* ---------- Model ---------- */
// // export default  mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);
// import mongoose, { Schema, Document, Types } from 'mongoose';

// /* ---------- Common Types ---------- */
// export type UUID = Types.ObjectId;

// /* ---------- Enums ---------- */
// export enum PlanFileType {
//   IMAGE = 'IMAGE',
//   PDF = 'PDF'
// }

// /* ---------- Interfaces ---------- */
// export interface PlanDocument extends Document {
//   projectId: UUID;
//   boqId?: UUID; // Optional, based on request body
//   title: string;
//   planType: string;
//   floor: string;
//   area: string;
//   fileUrl: string;
//   fileType: PlanFileType;
//   fileSize?: number; // Optional, from request
//   version: number;
//   previousPlanId?: UUID;
//   isLatest: boolean;
//   remarks?: string;
//   uploadedBy: UUID;
//   uploadedAt: Date;
// }

// /* =========================================================
//    SCHEMAS
//    ========================================================= */

// /* ---------- Plan Schema ---------- */
// const PlanSchema = new Schema<PlanDocument>(
//   {
//     projectId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Project',
//       required: true
//     },
//     boqId: {
//       type: Schema.Types.ObjectId,
//       // ✅ Fix: Removed ref: 'Boq' - no model registered, and not needed for basic ID storage
//     },
//     title: {
//       type: String,
//       required: true
//     },
//     planType: {
//       type: String,
//       required: true
//     },
//     floor: {
//       type: String,
//       required: true
//     },
//     area: {
//       type: String,
//       required: true
//     },
//     fileUrl: {
//       type: String,
//       required: true
//     },
//     fileType: {
//       type: String,
//       enum: Object.values(PlanFileType),
//       required: true
//     },
//     fileSize: {
//       type: Number
//     },
//     version: {
//       type: Number,
//       required: true,
//       default: 1
//     },
//     previousPlanId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Plan'
//     },
//     isLatest: {
//       type: Boolean,
//       default: true
//     },
//     remarks: {
//       type: String
//     },
//     uploadedBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     uploadedAt: {
//       type: Date,
//       default: Date.now
//     }
//   },
//   {
//     timestamps: true // Use Mongoose timestamps for createdAt/updatedAt
//   }
// );

// /* ---------- Model ---------- */
// export default mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);
import mongoose from "mongoose";
const { Schema } = mongoose;

const PlanSchema = new Schema(
  {
    // 🔗 Core References
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    boqId: {
      type: Schema.Types.ObjectId,
      ref: "BOQ",
    },

    // 📄 Plan Identity
    title: {
      type: String,
      required: true,
      trim: true,
    },

    planType: {
      type: String,
      enum: [
        "architectural",
        "structural",
        "services",
        "execution",
        "shop_drawing",
      ],
      required: true,
      index: true,
    },

    // 🏢 Context Mapping
    floor: {
      type: String, // e.g. Ground Floor, Typical Floor, Basement
      index: true,
    },

    area: {
      type: String, // Block A, Villa Unit, Podium
      index: true,
    },

    // 📁 File Metadata
    file: {
      url: { type: String, required: true },
      fileType: { type: String }, // pdf, jpg, png
      fileSize: { type: Number }, // bytes
      originalName: { type: String },
    },

    // 🔄 Version Control
    version: {
      type: Number,
      default: 1,
    },

    isLatest: {
      type: Boolean,
      default: true,
      index: true,
    },

    previousPlanId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },

    // 📝 Notes / Change Summary
    remarks: {
      type: String,
      trim: true,
    },

    // 👤 Audit
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  { timestamps: true }
);

/**
 * 🔐 Constraint:
 * Only ONE latest plan per:
 * project + planType + floor + area
 */
PlanSchema.index(
  {
    projectId: 1,
    planType: 1,
    floor: 1,
    area: 1,
    isLatest: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isLatest: true },
  }
);
delete mongoose.models.Plan
export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
