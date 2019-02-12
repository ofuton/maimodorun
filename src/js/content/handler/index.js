import detectPage from 'utils/detect-page';
import ThreadHandler from 'content/handler/thread-handler';
import PeopleHandler from 'content/handler/people-handler';
import MessageHandler from 'content/handler/message-handler';
import RecordHandler from 'content/handler/record-handler';

const buildHandler = () => {
    const page = detectPage();

    switch (page) {
    case 'thread':
        return new ThreadHandler();
    case 'people':
        return new PeopleHandler();
    case 'message':
        return new MessageHandler();
    case 'record':
        return new RecordHandler();
    default:
        return null;
    }
};

export default buildHandler;
