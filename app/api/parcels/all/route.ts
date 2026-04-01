import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allParcels = await prisma.parcel.findMany({
            include: {
                user: true,
            },
            orderBy: {
                created_at: "desc",
            },
        })
        return NextResponse.json(allParcels);
    } catch (error) {
        console.log("Error fetching parcels:", error);
        return NextResponse.json({ error: "Failed to fetch parcels" }, { status: 500 });
    }
}