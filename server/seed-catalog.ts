import { db } from "./db";
import { services, spareParts, specializations, serviceSpecializations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedCatalog() {
  console.log("🌱 Seeding catalog data...");

  try {
    // Get specializations for service linking
    const allSpecs = await db.select().from(specializations);
    const electricSpec = allSpecs.find(s => s.code === "electric");
    const mechanicSpec = allSpecs.find(s => s.code === "mechanic");
    const batterySpec = allSpecs.find(s => s.code === "battery");
    const acSpec = allSpecs.find(s => s.code === "ac");

    // ===== Services =====
    const existingServices = await db.select().from(services);
    if (existingServices.length === 0) {
      console.log("Creating sample services...");
      
      const sampleServices = [
        {
          nameAr: "فحص شامل للنظام الهجين",
          nameEn: "Comprehensive Hybrid System Inspection",
          descAr: "فحص كامل لجميع مكونات النظام الهجين بما في ذلك البطارية والمحرك الكهربائي",
          descEn: "Complete inspection of all hybrid system components including battery and electric motor",
          price: "250.00",
          expectedDurationMinutes: 90,
          specializationId: electricSpec?.id,
        },
        {
          nameAr: "صيانة بطارية هجينة",
          nameEn: "Hybrid Battery Maintenance",
          descAr: "فحص واختبار بطارية الهايبرد وتوازن الخلايا",
          descEn: "Hybrid battery inspection, testing and cell balancing",
          price: "350.00",
          expectedDurationMinutes: 120,
          specializationId: batterySpec?.id,
        },
        {
          nameAr: "استبدال بطارية هجينة",
          nameEn: "Hybrid Battery Replacement",
          descAr: "استبدال بطارية النظام الهجين بأخرى أصلية أو معتمدة",
          descEn: "Replacement of hybrid system battery with OEM or certified battery",
          price: "2500.00",
          expectedDurationMinutes: 180,
          specializationId: batterySpec?.id,
        },
        {
          nameAr: "صيانة المحرك الكهربائي",
          nameEn: "Electric Motor Service",
          descAr: "فحص وصيانة المحرك الكهربائي ووحدة التحكم",
          descEn: "Inspection and service of electric motor and control unit",
          price: "450.00",
          expectedDurationMinutes: 150,
          specializationId: electricSpec?.id,
        },
        {
          nameAr: "فحص نظام الفرامل التجديدي",
          nameEn: "Regenerative Braking System Check",
          descAr: "فحص واختبار نظام الفرامل التجديدي وكفاءته",
          descEn: "Inspection and testing of regenerative braking system efficiency",
          price: "180.00",
          expectedDurationMinutes: 60,
          specializationId: electricSpec?.id,
        },
        {
          nameAr: "صيانة دورية شاملة",
          nameEn: "Complete Periodic Maintenance",
          descAr: "صيانة دورية كاملة للمحرك والنظام الهجين والتكييف",
          descEn: "Complete periodic maintenance for engine, hybrid system and AC",
          price: "400.00",
          expectedDurationMinutes: 180,
          specializationId: mechanicSpec?.id,
        },
        {
          nameAr: "تغيير زيت المحرك",
          nameEn: "Engine Oil Change",
          descAr: "تغيير زيت المحرك والفلتر باستخدام زيوت معتمدة",
          descEn: "Engine oil and filter change using certified oils",
          price: "120.00",
          expectedDurationMinutes: 45,
          specializationId: mechanicSpec?.id,
        },
        {
          nameAr: "صيانة نظام التبريد",
          nameEn: "Cooling System Maintenance",
          descAr: "فحص وصيانة نظام التبريد للبطارية والمحرك",
          descEn: "Inspection and maintenance of battery and engine cooling system",
          price: "200.00",
          expectedDurationMinutes: 90,
          specializationId: mechanicSpec?.id,
        },
        {
          nameAr: "صيانة نظام التكييف",
          nameEn: "AC System Service",
          descAr: "فحص وصيانة نظام التكييف وإعادة شحن الفريون",
          descEn: "AC system inspection, service and refrigerant recharge",
          price: "220.00",
          expectedDurationMinutes: 75,
          specializationId: acSpec?.id,
        },
        {
          nameAr: "فحص الكمبيوتر والأخطاء",
          nameEn: "Computer Diagnostics & Error Scanning",
          descAr: "فحص كمبيوتر السيارة وقراءة رموز الأعطال",
          descEn: "Vehicle computer diagnostics and error code reading",
          price: "80.00",
          expectedDurationMinutes: 30,
          specializationId: electricSpec?.id,
        },
        {
          nameAr: "فحص ما قبل الشراء",
          nameEn: "Pre-Purchase Inspection",
          descAr: "فحص شامل للسيارة الهجينة قبل الشراء",
          descEn: "Comprehensive hybrid vehicle inspection before purchase",
          price: "300.00",
          expectedDurationMinutes: 120,
          specializationId: mechanicSpec?.id,
        },
        {
          nameAr: "تبديل إطارات",
          nameEn: "Tire Replacement",
          descAr: "تبديل الإطارات مع الموازنة والضبط",
          descEn: "Tire replacement with balancing and alignment",
          price: "150.00",
          expectedDurationMinutes: 60,
          specializationId: mechanicSpec?.id,
        },
      ];

      for (const service of sampleServices) {
        const [created] = await db.insert(services).values(service).returning();
        
        // Link service to specialization if exists
        if (service.specializationId) {
          await db.insert(serviceSpecializations).values({
            serviceId: created.id,
            specializationId: service.specializationId,
          });
        }
      }
      
      console.log(`✅ Created ${sampleServices.length} sample services`);
    } else {
      console.log("ℹ️  Services already exist");
    }

    // ===== Spare Parts =====
    const existingParts = await db.select().from(spareParts);
    if (existingParts.length === 0) {
      console.log("Creating sample spare parts...");
      
      const sampleParts = [
        {
          nameAr: "بطارية هجينة - تويوتا بريوس",
          nameEn: "Hybrid Battery - Toyota Prius",
          partCode: "HB-PRIUS-2015",
          unitPrice: "2200.00",
        },
        {
          nameAr: "بطارية هجينة - هوندا سيفيك",
          nameEn: "Hybrid Battery - Honda Civic",
          partCode: "HB-CIVIC-2016",
          unitPrice: "2400.00",
        },
        {
          nameAr: "بطارية هجينة - كامري هايبرد",
          nameEn: "Hybrid Battery - Camry Hybrid",
          partCode: "HB-CAMRY-2017",
          unitPrice: "2600.00",
        },
        {
          nameAr: "محول الطاقة الهجين",
          nameEn: "Hybrid Power Inverter",
          partCode: "INV-GEN3",
          unitPrice: "850.00",
        },
        {
          nameAr: "مروحة تبريد البطارية",
          nameEn: "Battery Cooling Fan",
          partCode: "BCF-001",
          unitPrice: "180.00",
        },
        {
          nameAr: "فلتر زيت محرك",
          nameEn: "Engine Oil Filter",
          partCode: "OF-STD",
          unitPrice: "25.00",
        },
        {
          nameAr: "زيت محرك 0W-20 هجين",
          nameEn: "0W-20 Hybrid Engine Oil",
          partCode: "OIL-0W20-5L",
          unitPrice: "45.00",
        },
        {
          nameAr: "فلتر هواء المحرك",
          nameEn: "Engine Air Filter",
          partCode: "AF-001",
          unitPrice: "35.00",
        },
        {
          nameAr: "فلتر هواء المقصورة",
          nameEn: "Cabin Air Filter",
          partCode: "CAF-001",
          unitPrice: "40.00",
        },
        {
          nameAr: "فلتر بنزين",
          nameEn: "Fuel Filter",
          partCode: "FF-001",
          unitPrice: "55.00",
        },
        {
          nameAr: "سائل تبريد هجين",
          nameEn: "Hybrid Coolant Fluid",
          partCode: "COOL-HYB-4L",
          unitPrice: "65.00",
        },
        {
          nameAr: "فريون تكييف R134a",
          nameEn: "R134a AC Refrigerant",
          partCode: "REF-R134A",
          unitPrice: "80.00",
        },
        {
          nameAr: "ضاغط تكييف",
          nameEn: "AC Compressor",
          partCode: "AC-COMP-001",
          unitPrice: "650.00",
        },
        {
          nameAr: "بطارية 12 فولت مساعدة",
          nameEn: "12V Auxiliary Battery",
          partCode: "BAT-12V-AUX",
          unitPrice: "220.00",
        },
        {
          nameAr: "فرامل أمامية (طقم)",
          nameEn: "Front Brake Pads Set",
          partCode: "BRK-F-SET",
          unitPrice: "180.00",
        },
        {
          nameAr: "فرامل خلفية (طقم)",
          nameEn: "Rear Brake Pads Set",
          partCode: "BRK-R-SET",
          unitPrice: "160.00",
        },
        {
          nameAr: "أقراص فرامل أمامية (زوج)",
          nameEn: "Front Brake Rotors (Pair)",
          partCode: "ROTOR-F",
          unitPrice: "280.00",
        },
        {
          nameAr: "كابل شحن هجين",
          nameEn: "Hybrid Charging Cable",
          partCode: "CHG-CABLE",
          unitPrice: "320.00",
        },
        {
          nameAr: "حساس الأكسجين",
          nameEn: "Oxygen Sensor",
          partCode: "O2-SENSOR",
          unitPrice: "190.00",
        },
        {
          nameAr: "شمعات إشعال (طقم 4)",
          nameEn: "Spark Plugs Set (4pcs)",
          partCode: "SPARK-4SET",
          unitPrice: "120.00",
        },
      ];

      await db.insert(spareParts).values(sampleParts);
      console.log(`✅ Created ${sampleParts.length} sample spare parts`);
    } else {
      console.log("ℹ️  Spare parts already exist");
    }

    console.log("✨ Catalog seeding completed successfully!");
  } catch (error) {
    console.error("❌ Catalog seeding failed:", error);
    throw error;
  }
}

seedCatalog()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
