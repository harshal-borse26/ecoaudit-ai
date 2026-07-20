import prisma from "../config/prisma.js";

export const createFacility = async (data, companyId) => {
  const {
    name,
    type,
    address,
    city,
    state,
    country,
    postalCode,
  } = data;

  if (!name || !type || !address || !city || !state || !country) {
    throw new Error("All required fields must be provided");
  }

  const facility = await prisma.facility.create({
    data: {
      name,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      companyId,
    },
  });

  return facility;
};

export const getFacilities = async (companyId) => {
  return await prisma.facility.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getFacilityById = async (id, companyId) => {
  const facility = await prisma.facility.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  return facility;
};

export const deleteFacility = async (id, companyId) => {
  const facility = await prisma.facility.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  await prisma.facility.delete({
    where: {
      id,
    },
  });

  return;
};

export const updateFacility = async (id, companyId, data) => {
  const facility = await prisma.facility.findFirst({
    where: {
      id,
      companyId,
    },
  });

  if (!facility) {
    throw new Error("Facility not found");
  }

  return await prisma.facility.update({
    where: {
      id,
    },
    data,
  });
};