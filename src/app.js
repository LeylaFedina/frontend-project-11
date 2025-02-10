import i18next from 'i18next';
import 'bootstrap';
import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import validate, { createLink } from './utils.js';
import watch from './view.js';
import ru from './lang/ru.js';
import parse from './parser.js';
import local from './lang/lang.js';

yup.setLocale(local);

export default () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();

  const elements = {
    staticEl: {
      title: document.querySelector('h1'),
      subtitle: document.querySelector('.lead'),
      label: document.querySelector('[for="url-input"]'),
      button: document.querySelector('[type="submit"]'),
    },
    form: document.querySelector('form'),
    input: document.getElementById('url-input'),
    errorElement: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
  };

  const state = {
    form: {
      status: 'pending',
      errors: '',
    },
    loadingProcess: {
      status: 'sending',
      error: '',
    },
    posts: [],
    feeds: [],
    ui: {
      activePostId: '',
      touchedPostId: new Set(),
    },
  };

  const timeout = 5000;

  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources: { ru },
  }).then(() => {
    const { watchedState, renderForm } = watch(elements, i18n, state);

    renderForm();

    const getUpdateContent = (feeds) => {
      const promises = feeds.map(({ url }) => axios.get(createLink(url))
        .then((responce) => {
          const parseData = parse(responce.data.contents);
          const { posts } = parseData;
          const existPosts = watchedState.posts.map((post) => post.url);
          const newPosts = posts.filter((post) => !existPosts.includes(post.url));
          const updatePosts = newPosts.map((post) => ({ ...post, id: _.uniqueId() }));
          watchedState.posts = [...updatePosts, ...watchedState.posts];
        }));

      Promise.all(promises)
        .finally(() => {
          setTimeout(() => getUpdateContent(watchedState.feeds), timeout);
        });
    };

    getUpdateContent(watchedState.feeds);

    elements.postsContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        watchedState.ui.touchedPostId.add(e.target.id);
      }
      if (e.target.tagName === 'BUTTON') {
        watchedState.ui.touchedPostId.add(e.target.dataset.id);
        watchedState.ui.activePostId = e.target.dataset.id;
      }
    });

    // Прослушивание формы отправки
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const urlTarget = formData.get('url').trim();
      const urlFeeds = watchedState.feeds.map(({ url }) => url);

      watchedState.loadingProcess.status = '';
      watchedState.loadingProcess.status = 'sending';

      validate(urlTarget, urlFeeds)
        .then(({ url }) => axios.get(createLink(url)))
        .then((responce) => {
          const parseData = parse(responce.data.contents);
          const { feed, posts } = parseData;
          watchedState.feeds.push({ ...feed, feedId: _.uniqueId(), url: urlTarget });
          posts.forEach((post) => watchedState.posts.push({ ...post, id: _.uniqueId() }));
          watchedState.loadingProcess.status = 'finished';
          watchedState.loadingProcess.error = '';
        })
        .catch((error) => {
          if (error.isAxiosError) {
            watchedState.loadingProcess.error = 'networkError';
          } else if (error.message === 'invalidRSS') {
            watchedState.loadingProcess.error = 'invalidRSS';
          } else {
            watchedState.form.errors = error.message;
          }
        });
    });
  });
};
