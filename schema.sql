-- Script para actualizar la base de datos
-- Ejecutar este script para agregar los campos 'usuario' y 'altura' a la tabla lecturas

USE bascula_db;

-- Agregar columna 'usuario' si no existe
ALTER TABLE lecturas
ADD COLUMN IF NOT EXISTS usuario VARCHAR(100) DEFAULT NULL;

-- Agregar columna 'altura' si no existe (en metros, ej: 1.75)
ALTER TABLE lecturas
ADD COLUMN IF NOT EXISTS altura DECIMAL(3,2) DEFAULT NULL;

-- Agregar columna 'recomendacion' para almacenar las sugerencias generadas
ALTER TABLE lecturas
ADD COLUMN IF NOT EXISTS recomendacion TEXT DEFAULT NULL;

-- Ver estructura actualizada
DESCRIBE lecturas;

-- Ejemplo de estructura esperada:
-- +--------+--------------+------+-----+-------------------+----------------+
-- | Field  | Type         | Null | Key | Default           | Extra          |
-- +--------+--------------+------+-----+-------------------+----------------+
-- | id     | int          | NO   | PRI | NULL              | auto_increment |
-- | peso   | decimal(5,2) | NO   |     | NULL              |                |
-- | usuario| varchar(100) | YES  |     | NULL              |                |
-- | altura | decimal(3,2) | YES  |     | NULL              |                |
-- | fecha  | timestamp    | YES  |     | CURRENT_TIMESTAMP |                |
-- +--------+--------------+------+-----+-------------------+----------------+
