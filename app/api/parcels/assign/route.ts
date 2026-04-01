import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { parcel_id, user_id } = body;

        //check if parcel_id is missing
        if (parcel_id === undefined || parcel_id === null) {
            return NextResponse.json({ error: "Parcel ID is required" }, { status: 400 });
        }

        const updatedParcel = await prisma.parcel.update({
            where: { id: Number(parcel_id) },
            data: { 
                user_id: user_id === null ? null : Number(user_id) 
            },
        });

        return NextResponse.json(updatedParcel);
    } catch (error) {
        console.error("Prisma Error:", error);
        return NextResponse.json({ error: "Failed to update parcel" }, { status: 500 });
    }
}