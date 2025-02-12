import handleEvents from './handleEvents';
import { getValue, publishMessage, setValue, exists, AlertEvent } from '../common';

jest.mock('../common', () => ({
    getValue: jest.fn(),
    publishMessage: jest.fn(),
    setValue: jest.fn(),
    exists: jest.fn(),
}));

describe('handleEvents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add the field to redis and publish the event if it does not exist', async () => {
        const event: AlertEvent = {
            location: 'Jerusalem',
            type: 'open',
            timestamp: new Date().toISOString(),
            duration: 10,
            uuid: 'uuid1'
        };

        (exists as jest.Mock).mockResolvedValue(false);
        (getValue as jest.Mock).mockResolvedValue(null);

        await handleEvents(event);

        expect(getValue).toHaveBeenCalledWith(`alerts:${event.location}`);
        expect(exists).toHaveBeenCalledWith(`id:${event.uuid}`);
        expect(publishMessage).toHaveBeenCalled();
        expect(setValue).toHaveBeenCalled();
    });

    it('should not publish the event if it already exists', async () => {
        const event: AlertEvent = {
            location: 'Jerusalem',
            type: 'open',
            timestamp: new Date().toISOString(),
            duration: 10,
            uuid: 'uuid1'
        };

        (exists as jest.Mock).mockResolvedValue(true);
        (getValue as jest.Mock).mockResolvedValue(null);

        await handleEvents(event);

        expect(exists).toHaveBeenCalledWith(`id:${event.uuid}`);
        expect(publishMessage).not.toHaveBeenCalled();
        expect(setValue).not.toHaveBeenCalledWith(`id:${event.uuid}`, '', expect.any(Date));
    });

    it('should update the duration if the event already exists in redis', async () => {
        const event: AlertEvent = {
            location: 'Haifa',
            type: 'close',
            timestamp: new Date().toISOString(),
            duration: 10,
            uuid: 'uuid1'
        };

        const existingEvent = {
            location: 'Haifa',
            type: 'close',
            sentTime: new Date().toISOString(),
            duration: new Date(new Date().getTime() + 5 * 60000).toISOString(),
            eventType: 'open'
        };

        (exists as jest.Mock).mockResolvedValue(false);
        (getValue as jest.Mock).mockResolvedValue(JSON.stringify(existingEvent));

        await handleEvents(event);

        expect(getValue).toHaveBeenCalledWith(`alerts:${event.location}`);
        expect(publishMessage).toHaveBeenCalledTimes(2);
        expect(setValue).toHaveBeenCalled();
    });
});