export const invoices = [
  {
    id: "INV-2025-001",
    tripId: "t1",
    generatedDate: "2025-06-10",
    status: "unpaid",
    travelers: ["Alex Rivera"],
    items: [
      { id: "inv1i1", category: "Hotel", description: "Hotel Le Marais — Paris", qty: "6 nights", unitCost: 220, amount: 1320 },
      { id: "inv1i2", category: "Hotel", description: "Hotel Artemide — Rome", qty: "6 nights", unitCost: 180, amount: 1080 },
      { id: "inv1i3", category: "Travel", description: "Flight DEL → PAR (round trip)", qty: "1", unitCost: 850, amount: 850 },
      { id: "inv1i4", category: "Travel", description: "Train PAR → ROM (first class)", qty: "1", unitCost: 120, amount: 120 },
      { id: "inv1i5", category: "Activity", description: "Cooking class — Paris", qty: "1", unitCost: 65, amount: 65 },
      { id: "inv1i6", category: "Activity", description: "Museum Pass — Paris", qty: "1", unitCost: 30, amount: 30 },
      { id: "inv1i7", category: "Activity", description: "Wine Tasting Tour — Rome", qty: "1", unitCost: 85, amount: 85 },
      { id: "inv1i8", category: "Food", description: "Daily dining budget", qty: "13 days", unitCost: 80, amount: 1040 }
    ],
    subtotal: 4590,
    tax: 229.5,
    discount: 200,
    grandTotal: 4619.5
  },
  {
    id: "INV-2025-002",
    tripId: "t2",
    generatedDate: "2025-03-12",
    status: "paid",
    travelers: ["Alex Rivera"],
    items: [
      { id: "inv2i1", category: "Hotel", description: "Park Hyatt Tokyo", qty: "5 nights", unitCost: 380, amount: 1900 },
      { id: "inv2i2", category: "Hotel", description: "Ryokan Kyoto Gardens", qty: "3 nights", unitCost: 250, amount: 750 },
      { id: "inv2i3", category: "Travel", description: "Flight DEL → NRT (round trip)", qty: "1", unitCost: 720, amount: 720 },
      { id: "inv2i4", category: "Travel", description: "Shinkansen Tokyo → Kyoto", qty: "1", unitCost: 130, amount: 130 },
      { id: "inv2i5", category: "Activity", description: "Tea Ceremony — Kyoto", qty: "1", unitCost: 40, amount: 40 },
      { id: "inv2i6", category: "Activity", description: "Street Food Tour — Tokyo", qty: "1", unitCost: 45, amount: 45 },
      { id: "inv2i7", category: "Food", description: "Daily dining budget", qty: "9 days", unitCost: 70, amount: 630 }
    ],
    subtotal: 4215,
    tax: 210.75,
    discount: 0,
    grandTotal: 4425.75
  }
];

export default invoices;
