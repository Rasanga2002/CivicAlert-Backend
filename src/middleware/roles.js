// authorizeRole('policeman') or authorizeRole('user')
export default function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    if (req.user.role !== role) {
      res.status(403);
      throw new Error('Forbidden: insufficient role');
    }
    next();
  };
};
