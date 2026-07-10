import type { Client } from "@/types/booking";

export const clients: Client[] = [
  {
    id: "client-amy",
    name: "Amy Richardson",
    email: "amy.richardson@example.com",
    phone: "(601) 555-0128",
    address: "215 Belle Meade Blvd, Jackson, MS 39211",
    role: "Homeowner",
  },
  {
    id: "client-liam",
    name: "Liam Foster",
    email: "liam.foster@example.com",
    phone: "(601) 555-0181",
    address: "900 Lakeland Dr, Jackson, MS 39216",
    role: "Office Manager",
  },
  {
    id: "client-sarah-mitchell",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    phone: "(601) 555-0142",
    address: "482 Oakwood Lane, Jackson, MS 39211",
    role: "Homeowner",
  },
  {
    id: "client-james-rodriguez",
    name: "James Rodriguez",
    email: "j.rodriguez@example.com",
    phone: "(601) 555-0198",
    address: "1200 Commerce Park Dr, Suite 400, Jackson, MS 39201",
    role: "Office Manager",
  },
  {
    id: "client-emily-chen",
    name: "Emily Chen",
    email: "emily.chen@example.com",
    phone: "(601) 555-0173",
    address: "88 Magnolia Court, Ridgeland, MS 39157",
    role: "Real Estate Agent",
  },
  {
    id: "client-david-thompson",
    name: "David Thompson",
    email: "david@thompsonkitchen.com",
    phone: "(601) 555-0165",
    address: "305 Capitol Street, Jackson, MS 39201",
    role: "Restaurant Owner",
  },
];

export function getClientById(id: string): Client | undefined {
  return clients.find((client) => client.id === id);
}
