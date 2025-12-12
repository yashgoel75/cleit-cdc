import connect from "@/lib/mongodb";

export async function register() {
  await connect();
}