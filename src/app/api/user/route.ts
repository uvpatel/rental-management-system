import { db } from "@/index";
import { usersTable } from "@/db/schema";


export async function GET() {
      const users = await db.select().from(usersTable);
      console.log('Getting all users from the database: ', users)
}