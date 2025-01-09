import onChange from 'on-change';

export default (elements, i18n, state) => {
    const { t } = i18n;
    const renderForm = () => {
        Object.entries(elements).forEach(([key, value]) => {
            const element = value;
            element.textContent = t(`${key}`) ?? '';
        });
    };
    const watchedState = onChange(state, (path) => {
        if (path === 'isValid') {
        } else if (path === 'errors') {
        }
    });
    return {
        watchedState,
        renderForm,
    };
};
