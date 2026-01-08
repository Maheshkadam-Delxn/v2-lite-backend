// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import ProjectType from "@/models/ProjectType";
// import mongoose from "mongoose";
// import { getSession } from "@/lib/auth";

// /* ================= CHAT SESSION MODEL ================= */
// const ChatSession =
//   mongoose.models.ChatSession ||
//   mongoose.model(
//     "ChatSession",
//     new mongoose.Schema(
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//         step: { type: String, required: true },

//         category: String,
//         projectTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectType" },
// architecturalPlan: Boolean,

//         plans: {
//           type: [
//             {
//               planName: String,
//               planFileUrl: String,
//             },
//           ],
//           default: [],
//         },
//         landArea: String,
//         customRequirements: String,
//         budget: String,

//         surveyType: String,

//         projectName: String,
//         projectLocation: String,

//         supportingDocumentUrls: {
//           type: [String],
//           default: [],
//         },

//         mobileNumber: String,
//       },
//       { timestamps: true }
//     )
//   );

// /* ================= POST HANDLER ================= */
// export async function POST(req: Request) {
//   await dbConnect();

//   const session = await getSession(req as any);
//   if (!session)
//     return NextResponse.json({ success: false }, { status: 401 });

//   const userId = session.id || session.userId;
//   const { message, sessionId } = await req.json();

//   let chat =
//     sessionId && mongoose.Types.ObjectId.isValid(sessionId)
//       ? await ChatSession.findById(sessionId)
//       : null;

//   if (!chat) {
//     chat = await ChatSession.create({
//       userId,
//       step: "CATEGORY",
//       supportingDocumentUrls: [],
//     });
//   }

//   /* ================= START ================= */
//   if (message === "__START__" && chat.step === "CATEGORY") {
//     const categories = await ProjectType.distinct("category", { isActive: true });

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "What do you want to construct?",
//       options: categories.map((c) => ({ label: c, value: c })),
//     });
//   }

//   /* ================= CATEGORY ================= */
//   if (chat.step === "CATEGORY") {
//     const categories = await ProjectType.distinct("category", { isActive: true });

//     if (!categories.includes(message)) {
//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Please select a valid category",
//         options: categories.map((c) => ({ label: c, value: c })),
//       });
//     }

//     chat.category = message;
//     chat.step = "SELECT_TEMPLATE";
//     await chat.save();

//     const templates = await ProjectType.find({
//       category: message,
//       isActive: true,
//     });

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Select a template",
//       cards: [
//         ...templates.map((t) => ({
//           id: t._id,
//           title: t.projectTypeName,
//           landArea: t.landArea,
//           budget: `${t.budgetMinRange} - ${t.budgetMaxRange}`,
//         })),
//         {
//           id: "OTHER_TEMPLATE",
//           title: "Other (Custom Requirement)",
//           landArea: "Flexible",
//           budget: "As per requirement",
//         },
//       ],
//     });
//   }

//   /* ================= SELECT TEMPLATE ================= */
//   if (chat.step === "SELECT_TEMPLATE") {
//     // Custom flow
//     if (message === "OTHER_TEMPLATE") {
//       chat.projectTypeId = null;
//       chat.step = "LAND_AREA";
//       await chat.save();

//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Enter land area (sq.ft)",
//         inputType: "number",
//       });
//     }

//     // Template flow
//     if (mongoose.Types.ObjectId.isValid(message)) {
//       chat.projectTypeId = message;
//       chat.step = "SURVEY_TYPE";
//       await chat.save();

//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Choose survey type",
//         options: [
//           { label: "Use Inbuilt Template Survey", value: "TEMPLATE_SURVEY" },
//           { label: "Custom On-Site Survey", value: "CUSTOM_SURVEY" },
//         ],
//       });
//     }

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Please select a valid template",
//     });
//   }

//   /* ================= LAND AREA (CUSTOM ONLY) ================= */
//   if (chat.step === "LAND_AREA") {
//     chat.landArea = message;
//     chat.step = "ARCH_PLAN_DECISION";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Describe your requirements (floors, rooms, etc.)",
//     });
//   }

//    if (chat.step === "ARCH_PLAN_DECISION") {
//     chat.architecturalPlan = message === "YES_ARCH";
//     chat.step = chat.architecturalPlan ? "UPLOAD_ARCH_PLAN" : "OTHER_PLAN_DECISION";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: chat.architecturalPlan
//         ? "Upload your architectural plan"
//         : "Do you have any other plan?",
//       inputType: chat.architecturalPlan ? "file" : undefined,
//       options: !chat.architecturalPlan
//         ? [
//             { label: "Yes", value: "YES_OTHER_PLAN" },
//             { label: "No", value: "NO_OTHER_PLAN" },
//           ]
//         : undefined,
//     });
//   }

//   /* ================= UPLOAD ARCH PLAN ================= */
//   if (chat.step === "UPLOAD_ARCH_PLAN") {
//     chat.plans.push({
//       planName: "Architectural Plan",
//       planFileUrl: message,
//     });

//     chat.step = "CUSTOM_REQUIREMENTS";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Describe your requirements",
//     });
//   }

//   /* ================= OTHER PLAN DECISION ================= */
//   if (chat.step === "OTHER_PLAN_DECISION") {
//     if (message === "YES_OTHER_PLAN") {
//       chat.step = "OTHER_PLAN_NAME";
//       await chat.save();

//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Enter plan name",
//       });
//     }

//     chat.step = "CUSTOM_REQUIREMENTS";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Describe your requirements",
//     });
//   }

//   /* ================= OTHER PLAN NAME ================= */
//   if (chat.step === "OTHER_PLAN_NAME") {
//     chat.plans.push({ planName: message, planFileUrl: null });
//     chat.step = "UPLOAD_OTHER_PLAN";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Upload the plan",
//       inputType: "file",
//     });
//   }

//   /* ================= UPLOAD OTHER PLAN ================= */
//   if (chat.step === "UPLOAD_OTHER_PLAN") {
//     chat.plans[chat.plans.length - 1].planFileUrl = message;
//     chat.step = "CUSTOM_REQUIREMENTS";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Describe your requirements",
//     });
//   }
//   /* ================= CUSTOM REQUIREMENTS ================= */
//   if (chat.step === "CUSTOM_REQUIREMENTS") {
//     chat.customRequirements = message;
//     chat.step = "BUDGET";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Enter estimated budget",
//       inputType: "number",
//     });
//   }

//   /* ================= BUDGET ================= */
//   if (chat.step === "BUDGET") {
//     chat.budget = message;
//     chat.step = "PROJECT_NAME";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Enter project name",
//     });
//   }

//   /* ================= SURVEY TYPE (TEMPLATE ONLY) ================= */
//   if (chat.step === "SURVEY_TYPE") {
//     if (!["TEMPLATE_SURVEY", "CUSTOM_SURVEY"].includes(message)) {
//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Please select a valid survey option",
//         options: [
//           { label: "Use Inbuilt Template Survey", value: "TEMPLATE_SURVEY" },
//           { label: "Custom On-Site Survey", value: "CUSTOM_SURVEY" },
//         ],
//       });
//     }

//     chat.surveyType = message;
//     chat.step = "PROJECT_NAME";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Enter project name",
//     });
//   }

//   /* ================= PROJECT NAME ================= */
//   if (chat.step === "PROJECT_NAME") {
//     chat.projectName = message;
//     chat.step = "PROJECT_LOCATION";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Enter project location",
//     });
//   }

//   /* ================= PROJECT LOCATION ================= */
//   if (chat.step === "PROJECT_LOCATION") {
//     chat.projectLocation = message;
//     chat.step = "UPLOAD_SUPPORT_DOC";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Upload supporting document (PDF/Image)",
//       inputType: "file",
//     });
//   }

//   /* ================= UPLOAD SUPPORT DOC ================= */
//   if (chat.step === "UPLOAD_SUPPORT_DOC") {
//     if (!Array.isArray(chat.supportingDocumentUrls)) {
//       chat.supportingDocumentUrls = [];
//     }

//     chat.supportingDocumentUrls.push(message);
//     chat.step = "ADD_MORE_SUPPORT_DOC";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Do you want to upload another supporting document?",
//       options: [
//         { label: "Yes", value: "YES_MORE_DOC" },
//         { label: "No", value: "NO_MORE_DOC" },
//       ],
//     });
//   }

//   /* ================= ADD MORE SUPPORT DOC ================= */
//   if (chat.step === "ADD_MORE_SUPPORT_DOC") {
//     if (message === "YES_MORE_DOC") {
//       chat.step = "UPLOAD_SUPPORT_DOC";
//       await chat.save();

//       return NextResponse.json({
//         sessionId: chat._id,
//         botMessage: "Upload another supporting document",
//         inputType: "file",
//       });
//     }

//     chat.step = "MOBILE_NUMBER";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Enter your mobile number",
//       inputType: "phone",
//     });
//   }

//   /* ================= MOBILE NUMBER ================= */
//   if (chat.step === "MOBILE_NUMBER") {
//     chat.mobileNumber = message;
//     chat.step = "DONE";
//     await chat.save();

//     return NextResponse.json({
//       sessionId: chat._id,
//       botMessage: "Proposal generated successfully 🎉",
//       action: "PROPOSAL_READY",
//     });
//   }

//   /* ================= SAFE FALLBACK ================= */
//   return NextResponse.json({
//     sessionId: chat._id,
//     botMessage: "Please continue the chat",
//   });
// }



import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProjectType from "@/models/ProjectType";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth";

/* ================= CHAT SESSION MODEL ================= */
const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model(
    "ChatSession",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        step: { type: String, required: true },

        category: String,
        projectTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectType" },
        architecturalPlan: Boolean,

        plans: {
          type: [
            {
              planName: String,
              planFileUrl: String,
            },
          ],
          default: [],
        },
        landArea: String,
        customRequirements: String,
        budget: String,

        surveyType: String,

        projectName: String,
        projectLocation: String,

        supportingDocumentUrls: {
          type: [String],
          default: [],
        },

        mobileNumber: String,
      },
      { timestamps: true }
    )
  );

/* ================= POST HANDLER ================= */
export async function POST(req: Request) {
  await dbConnect();

  const session = await getSession(req as any);
  if (!session)
    return NextResponse.json({ success: false }, { status: 401 });

  const userId = session.id || session.userId;
  const { message, sessionId } = await req.json();

  let chat =
    sessionId && mongoose.Types.ObjectId.isValid(sessionId)
      ? await ChatSession.findById(sessionId)
      : null;

  if (!chat) {
    chat = await ChatSession.create({
      userId,
      step: "CATEGORY",
      supportingDocumentUrls: [],
    });
  }

  /* ================= START ================= */
  if (message === "__START__" && chat.step === "CATEGORY") {
    const categories = await ProjectType.distinct("category", { isActive: true });

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "What do you want to construct?",
      options: categories.map((c) => ({ label: c, value: c })),
    });
  }

  /* ================= CATEGORY ================= */
  if (chat.step === "CATEGORY") {
    const categories = await ProjectType.distinct("category", { isActive: true });

    if (!categories.includes(message)) {
      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Please select a valid category",
        options: categories.map((c) => ({ label: c, value: c })),
      });
    }

    chat.category = message;
    chat.step = "SELECT_TEMPLATE";
    await chat.save();

    const templates = await ProjectType.find({
      category: message,
      isActive: true,
    });

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Select a template",
      cards: [
        ...templates.map((t) => ({
          id: t._id,
          title: t.projectTypeName,
          landArea: t.landArea,
          budget: `${t.budgetMinRange} - ${t.budgetMaxRange}`,
        })),
        {
          id: "OTHER_TEMPLATE",
          title: "Other (Custom Requirement)",
          landArea: "Flexible",
          budget: "As per requirement",
        },
      ],
    });
  }

  /* ================= SELECT TEMPLATE ================= */
  if (chat.step === "SELECT_TEMPLATE") {
    // Custom flow
    if (message === "OTHER_TEMPLATE") {
      chat.projectTypeId = null;
      chat.step = "LAND_AREA";
      await chat.save();

      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Enter land area (sq.ft)",
        inputType: "number",
      });
    }

    // Template flow
    if (mongoose.Types.ObjectId.isValid(message)) {
      chat.projectTypeId = message;
      chat.step = "SURVEY_TYPE";
      await chat.save();

      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Choose survey type",
        options: [
          { label: "Use Inbuilt Template Survey", value: "TEMPLATE_SURVEY" },
          { label: "Custom On-Site Survey", value: "CUSTOM_SURVEY" },
        ],
      });
    }

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Please select a valid template",
    });
  }

  /* ================= LAND AREA (CUSTOM ONLY) ================= */
  if (chat.step === "LAND_AREA") {
    chat.landArea = message;
    chat.step = "ARCH_PLAN_DECISION";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Do you have architectural plan?",
      options: [
        { label: "Yes", value: "YES_ARCH" },
        { label: "No", value: "NO_ARCH" },
      ],
    });
  }

  /* ================= ARCHITECTURAL PLAN DECISION ================= */
  if (chat.step === "ARCH_PLAN_DECISION") {
    chat.architecturalPlan = message === "YES_ARCH";
    chat.step = chat.architecturalPlan ? "UPLOAD_ARCH_PLAN" : "OTHER_PLAN_DECISION";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: chat.architecturalPlan
        ? "Upload your architectural plan"
        : "Do you have any other plan?",
      inputType: chat.architecturalPlan ? "file" : undefined,
      options: !chat.architecturalPlan
        ? [
            { label: "Yes", value: "YES_OTHER_PLAN" },
            { label: "No", value: "NO_OTHER_PLAN" },
          ]
        : undefined,
    });
  }

  /* ================= UPLOAD ARCH PLAN ================= */
  if (chat.step === "UPLOAD_ARCH_PLAN") {
    chat.plans.push({
      planName: "Architectural Plan",
      planFileUrl: message,
    });

    chat.step = "CUSTOM_REQUIREMENTS";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Describe your requirements",
    });
  }

  /* ================= OTHER PLAN DECISION ================= */
  if (chat.step === "OTHER_PLAN_DECISION") {
    if (message === "YES_OTHER_PLAN") {
      chat.step = "OTHER_PLAN_NAME";
      await chat.save();

      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Enter plan name",
      });
    }

    chat.step = "CUSTOM_REQUIREMENTS";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Describe your requirements",
    });
  }

  /* ================= OTHER PLAN NAME ================= */
  if (chat.step === "OTHER_PLAN_NAME") {
    chat.plans.push({ planName: message, planFileUrl: null });
    chat.step = "UPLOAD_OTHER_PLAN";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Upload the plan",
      inputType: "file",
    });
  }

  /* ================= UPLOAD OTHER PLAN ================= */
  if (chat.step === "UPLOAD_OTHER_PLAN") {
    chat.plans[chat.plans.length - 1].planFileUrl = message;
    chat.step = "CUSTOM_REQUIREMENTS";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Describe your requirements",
    });
  }

  /* ================= CUSTOM REQUIREMENTS ================= */
  if (chat.step === "CUSTOM_REQUIREMENTS") {
    chat.customRequirements = message;
    chat.step = "BUDGET";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Enter estimated budget",
      inputType: "number",
    });
  }

  /* ================= BUDGET ================= */
  if (chat.step === "BUDGET") {
    chat.budget = message;
    chat.step = "PROJECT_NAME";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Enter project name",
    });
  }

  /* ================= SURVEY TYPE (TEMPLATE ONLY) ================= */
  if (chat.step === "SURVEY_TYPE") {
    if (!["TEMPLATE_SURVEY", "CUSTOM_SURVEY"].includes(message)) {
      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Please select a valid survey option",
        options: [
          { label: "Use Inbuilt Template Survey", value: "TEMPLATE_SURVEY" },
          { label: "Custom On-Site Survey", value: "CUSTOM_SURVEY" },
        ],
      });
    }

    chat.surveyType = message;
    chat.step = "PROJECT_NAME";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Enter project name",
    });
  }

  /* ================= PROJECT NAME ================= */
  if (chat.step === "PROJECT_NAME") {
    chat.projectName = message;
    chat.step = "PROJECT_LOCATION";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Enter project location",
    });
  }

  /* ================= PROJECT LOCATION ================= */
  if (chat.step === "PROJECT_LOCATION") {
    chat.projectLocation = message;
    chat.step = "UPLOAD_SUPPORT_DOC";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Upload supporting document (PDF/Image)",
      inputType: "file",
    });
  }

  /* ================= UPLOAD SUPPORT DOC ================= */
  if (chat.step === "UPLOAD_SUPPORT_DOC") {
    if (!Array.isArray(chat.supportingDocumentUrls)) {
      chat.supportingDocumentUrls = [];
    }

    chat.supportingDocumentUrls.push(message);
    chat.step = "ADD_MORE_SUPPORT_DOC";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Do you want to upload another supporting document?",
      options: [
        { label: "Yes", value: "YES_MORE_DOC" },
        { label: "No", value: "NO_MORE_DOC" },
      ],
    });
  }

  /* ================= ADD MORE SUPPORT DOC ================= */
  if (chat.step === "ADD_MORE_SUPPORT_DOC") {
    if (message === "YES_MORE_DOC") {
      chat.step = "UPLOAD_SUPPORT_DOC";
      await chat.save();

      return NextResponse.json({
        sessionId: chat._id,
        botMessage: "Upload another supporting document",
        inputType: "file",
      });
    }

    chat.step = "MOBILE_NUMBER";
    await chat.save();

    return NextResponse.json({
      sessionId: chat._id,
      botMessage: "Enter your mobile number",
      inputType: "phone",
    });
  }

  /* ================= MOBILE NUMBER ================= */
  /* ================= MOBILE NUMBER ================= */
if (chat.step === "MOBILE_NUMBER") {
  chat.mobileNumber = message;
  chat.step = "DONE";
  await chat.save();

  // Populate the projectType details if exists
  let projectTypeDetails = null;
  if (chat.projectTypeId) {
    projectTypeDetails = await ProjectType.findById(chat.projectTypeId).lean();
  }

  return NextResponse.json({
    sessionId: chat._id,
    botMessage: "Ready to submit your proposal?",
    action: "PROPOSAL_READY",
    proposalData: {
      ...chat.toObject(),
      projectTypeDetails
    }
  });
}
  /* ================= SAFE FALLBACK ================= */
  return NextResponse.json({
    sessionId: chat._id,
    botMessage: "Please continue the chat",
  });
}