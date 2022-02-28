import '@testing-library/jest-dom';
import './renderInBrowser';

expect.addSnapshotSerializer({
    test: value => typeof value?.rerender === 'function' && typeof value?.asFragment === 'function' && value?.container,
    print: (wrapper, serializer, ...rest) => serializer(wrapper.container.firstElementChild, serializer, ...rest),
});