import { timeStamp } from 'console';
import mongoose, {Schema} from 'mongoose';

const VendorSchema = new Schema(

   { name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    vendorcode: { type: String, required: true, unique: true},
    gstinno: { type: String, required: true},
    address: { type: String, required: true},
},
{
    timestamps: true
}

);

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema)

