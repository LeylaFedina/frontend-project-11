import * as yup from 'yup';


// Server fetch url for get queries
export const createLink = (url) => {
  const originsUrl = new URL('https://allorigins.hexlet.app/get?');
  originsUrl.searchParams.set('disableCache', 'true');
  originsUrl.searchParams.set('url', url);
  return originsUrl.toString();
};

const validate = (url, urlFeeds) => {
  const schema = yup.object().shape({
    url: yup
      .string()
      .url('errors.invalidUrl')
      .trim()
      .required()
      .notOneOf(urlFeeds, 'errors.existsRss'),
  });
  return schema.validate({ url });
};

export const proxyObj = (url) => url;
export default validate;
