CREATE TABLE "GaleriaImagen" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "caption" TEXT,
    "orden" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GaleriaImagen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GaleriaImagen_publicId_key" ON "GaleriaImagen"("publicId");
CREATE UNIQUE INDEX "GaleriaImagen_orden_key" ON "GaleriaImagen"("orden");
