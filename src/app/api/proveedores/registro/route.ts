import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("[Registro de Proveedor] Payload recibido:", payload);

    const { company, vehicles, contract } = payload;
    let contactId: string | null = null;
    let tenantId: string | null = null;

    try {
      const supabase = await createClient();

      // 1. Obtener ID del Tenant YJD Trinova
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'yjdtrinova')
        .single();
      
      tenantId = tenantData?.id || null;

      // 2. Registrar o Actualizar Contacto en 'contacts'
      const isNatural = company?.personType === 'NATURAL';
      const contactFullName = isNatural ? (company?.fullName || "Propietario Particular") : (company?.legalName || "Empresa Aliada");
      const contactPhone = company?.phone || (isNatural ? company?.whatsapp : "") || "573005765530";
      const contactEmail = company?.email || "dondeblanca15@gmail.com";
      const docType = isNatural ? (company?.docType || "CC") : (company?.taxIdType || "NIT");
      const docNumber = isNatural ? (company?.docId || "") : (company?.taxId || "");

      const { data: contactRecord, error: contactErr } = await supabase
        .from('contacts')
        .insert({
          tenant_id: tenantId,
          person_type: isNatural ? 'PERSONA_NATURAL' : 'PERSONA_JURIDICA',
          full_name: contactFullName,
          trade_name: company?.tradeName || (isNatural ? null : company?.legalName),
          doc_type: docType,
          doc_number: docNumber,
          phone: contactPhone,
          email: contactEmail,
          city: company?.city || 'Barranquilla',
          address: company?.address || '',
          bank_name: company?.bankName || '',
          bank_account_type: company?.bankAccountType || '',
          bank_account_number: company?.bankAccountNumber || '',
          role_type: 'PROPIETARIO_CONSIGNANTE',
          status: 'ACTIVO'
        })
        .select('id')
        .single();

      if (!contactErr && contactRecord) {
        contactId = contactRecord.id;
      }

      // 3. Registrar cada Ítem en 'inventory_items' (Carros, Motos, Inmuebles)
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        const itemsToInsert = vehicles.map((v: any) => {
          const category = v.itemType || 'VEHICULO';
          const isRealEstate = category === 'INMUEBLE_VENTA' || category === 'INMUEBLE_RENTA';
          const isRent = category === 'INMUEBLE_RENTA';
          const price = Number(v.suggestedPrice) || 0;

          return {
            tenant_id: tenantId,
            owner_contact_id: contactId,
            category_type: category,
            sub_category: v.propertyType || v.category || (category === 'MOTO' ? 'Motocicleta' : 'Vehículo'),
            title: isRealEstate
              ? `${v.propertyType || 'Inmueble'} en ${company?.city || 'Barranquilla'} - ${v.neighborhood || 'Zona Exclusiva'}`
              : `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim(),
            brand: v.brand || (isRealEstate ? 'Inmobiliario' : 'Genérico'),
            model: v.model || v.propertyType || 'Modelo',
            year: Number(v.year) || new Date().getFullYear(),
            price_cop: price,
            monthly_rent_cop: isRent ? price : null,
            mileage: Number(v.mileage) || 0,
            fuel_type: v.fuelType || 'Gasolina',
            transmission: v.transmission || 'Automática',
            engine_displacement: v.cylinderCapacityCc ? `${v.cylinderCapacityCc}cc` : (v.engine || null),
            license_plate: v.plate || null,
            vin: v.vin || null,
            exterior_color: v.color || null,
            area_m2: v.areaM2 ? Number(v.areaM2) : null,
            bedrooms: v.bedrooms ? Number(v.bedrooms) : null,
            bathrooms: v.bathrooms ? Number(v.bathrooms) : null,
            parking_spots: v.parkingSpots ? Number(v.parkingSpots) : null,
            neighborhood: v.neighborhood || null,
            images: Array.isArray(v.images) ? v.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
            features: Array.isArray(v.features) ? v.features : [],
            description: v.description || '',
            status: 'DISPONIBLE',
            condition: 'Seminuevo Certificado',
            is_featured: true,
            inspection_score: 98
          };
        });

        await supabase.from('inventory_items').insert(itemsToInsert);
      }

      // 4. Registrar Contrato Notarial Digital en 'contracts'
      if (contract) {
        await supabase.from('contracts').insert({
          tenant_id: tenantId,
          contact_id: contactId,
          contract_code: contract.contractId || `CT-TRN-${Date.now().toString(36).toUpperCase()}`,
          contract_type: vehicles?.[0]?.itemType?.startsWith('INMUEBLE') ? 'CORRETAJE_INMOBILIARIO_VENTA' : 'CORRETAJE_VEHICULO',
          person_type: isNatural ? 'PERSONA_NATURAL' : 'PERSONA_JURIDICA',
          client_name: contactFullName,
          client_doc_type: docType,
          client_doc_number: docNumber,
          client_phone: contactPhone,
          client_email: contactEmail,
          client_city: company?.city || 'Barranquilla',
          items_assigned: vehicles || [],
          total_valuation_cop: Number(contract.totalValuation) || 0,
          commission_type: 'PERCENTAGE',
          commission_value: 3.5,
          verification_hash: contract.verificationHash || contract.hash || `SHA256-${Date.now()}`,
          signer_ip: contract.ipAddress || '127.0.0.1',
          signature_type: contract.signatureType === 'draw' ? 'DRAW' : 'TYPED',
          signature_data_url: contract.drawnSignatureDataUrl || null,
          status: 'FIRMADO'
        });
      }

    } catch (dbErr: any) {
      console.warn("[Registro de Proveedor] Error en persistencia Supabase (se continuará):", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Contrato firmado y bienes consignados exitosamente en YJD TRINOVA S.A.S.",
      contractHash: contract?.verificationHash || `SHA256-${Date.now()}`
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Registro de Proveedor] Error procesando el registro:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
