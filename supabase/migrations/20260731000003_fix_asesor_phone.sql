-- Actualizar el teléfono de David Castillo (asesor_comercial) al número
-- principal de la hacienda. El número anterior 573028331190 causaba que
-- el botón flotante de WhatsApp del sitio público redirigiera al número
-- personal del asesor en lugar del número central 3150061597.

UPDATE public.profiles
SET phone = '573150061597'
WHERE role = 'asesor_comercial'
  AND phone = '573028331190';
