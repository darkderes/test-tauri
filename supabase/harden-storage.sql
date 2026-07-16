-- Remediación de auditoría: enumeración anónima del bucket "avatars".
-- Ejecutar en Supabase Dashboard > SQL Editor.
--
-- Hallazgo: la policy SELECT anónima sobre storage.objects permite LISTAR
-- las carpetas del bucket, filtrando los UUID de los usuarios
-- (POST /storage/v1/object/list/avatars devolvía cada <user_id>).
--
-- El bucket es público, así que las imágenes se sirven igual por
-- /storage/v1/object/public/avatars/<path> SIN esta policy. Es decir,
-- quitarla corta la enumeración y NO rompe la visualización de avatares
-- (la app usa getPublicUrl, no list).

drop policy if exists "Avatares lectura publica" on storage.objects;

-- No se recrea ninguna policy SELECT: un bucket público no la necesita
-- para servir archivos por URL directa.
