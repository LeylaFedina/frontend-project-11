export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const error = new Error('invalidRSS');
    console.log('Внимание! Отправляемые данные некорректны!');
    console.log('**** Ответ сервера ****');
    console.log(errorNode.textContent);
    console.log('***********************');
    throw error;
  }
  const feedTitle = doc.querySelector('channel > title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const feed = { title: feedTitle, description: feedDescription };
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((post) => {
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const url = post.querySelector('link').textContent;
    return { title, description, url };
  });
  return { feed, posts };
};
