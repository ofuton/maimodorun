import detectPage from 'utils/detect-page';
import ThreadHandler from 'content/handler/thread-handler';

const buildHandler = () => {
    const page = detectPage();

    switch (page) {
    case 'thread':
        return new ThreadHandler();
    default:
        return null;
    }
};

export default buildHandler;
