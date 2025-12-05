export function paginate(model: any, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return model.find().skip(skip).limit(limit);
}

export function getPaginationMeta(total: number, page = 1, limit = 10) {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages };
}
