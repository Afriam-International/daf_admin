import axios from "axios";

export const blogService = {
  getPosts: ({ page = 1, perPage = 12 } = {}) =>
    axios.get(`${import.meta.env.VITE_WP_URL}/wp/v2/posts`, {
      params: {
        categories: 1722,
        _embed: 1,
        per_page: perPage,
        page,
      },
    }),
};
