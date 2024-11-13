export default function setAPIType(APIType) {
  return (req, _res, next) => {
    req.APIType = APIType;
    next();
  };
}
