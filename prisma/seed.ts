import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

async function main() {
    console.log("seeding db")

    // 3 users

    const users = [
        {
            name: "Giorgi",
            room_number: "ABC-1984123",
            email: "Giorgi@example.com"
        },

        {
            name: "Nino",
            room_number: "ABC-1984124",
            email: "nino@example.com"
        },

        {
            name: "Luka",
            room_number: "ABC-1984125",
            email: "luka@example.com"
        }
    ]


    for (const user of users) {
        await prisma.user.upsert({
            where: {room_number: user.room_number},
            update: {},
            create: user
        })
    }


    // 10 parcels

    const parcels = [
        {tracking_number: "TRK123456"},
        {tracking_number: "TRK123457"},
        {tracking_number: "TRK123458"},
        {tracking_number: "TRK123459"},
        {tracking_number: "TRK123460"},
        {tracking_number: "TRK123461"},
        {tracking_number: "TRK123462"},
        {tracking_number: "TRK123463"},
        {tracking_number: "TRK123464"},
        {tracking_number: "TRK123465"}
    ]

    for (const parcel of parcels) {
        await prisma.parcel.upsert({
            where: {tracking_number: parcel.tracking_number},
            update: {},
            create: parcel
        })
    }

    console.log("db seeding complete")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })