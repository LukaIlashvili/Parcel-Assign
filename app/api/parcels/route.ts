import {prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const unnassignedParcels = await prisma.parcel.findMany({
            where: {
                user_id: null,
            },
            orderBy: {
                created_at: "desc",
            },
        })
        return NextResponse.json(unnassignedParcels);
    } catch (error) {
        console.log("Error fetching parcels:", error);
        return NextResponse.json({ error: "Failed to fetch parcels" }, { status: 500 });
    }
}
