import React from 'react';
import omit from 'lodash/omit';
import { shallowEqual, isPromise } from './utils';

const defaultProps = [
  'component',
  'render',
  'children',
  'onFulfilled',
  'onRejected'
];

const getRequestProps = props => omit(props, Object.keys(defaultProps));

const defaultOptions = {
  debounce: () => false,
  shouldDataUpdate: (props, nextProps) => !shallowEqual(props, nextProps)
};

function createRequest(initialValue, mapPropsToRequest, options) {
  const { debounce, shouldDataUpdate } = Object.assign(
    {},
    defaultOptions,
    options
  );

  return class RequestComponent extends React.Component {
    static defaultProps = {
      onFulfilled: () => {},
      onRejected: () => {}
    };

    constructor(props) {
      super(props);
      this.timeout = null;
      this.requestProps = getRequestProps(props);
      this.request = mapPropsToRequest(this.requestProps);

      this.state = {
        isLoading: isPromise(this.request),
        args: {},
        data: initialValue,
        error: null
      };
    }

    componentDidMount() {
      this.fetchData(this.requestProps, this.request);
    }

    componentDidUpdate() {
      const nextRequestProps = getRequestProps(this.props);

      if (shouldDataUpdate(this.requestProps, nextRequestProps)) {
        const wait = debounce(this.requestProps, nextRequestProps);

        if (Number.isInteger(wait) && wait > 0) {
          clearTimeout(this.timeout);

          this.timeout = setTimeout(() => {
            this.requestProps = nextRequestProps;
            this.fetchData(nextRequestProps);
          }, wait);
        } else {
          this.requestProps = nextRequestProps;
          this.fetchData(nextRequestProps);
        }
      }
    }

    componentWillUnmount() {
      this.request = null;
      clearTimeout(this.timeout);
    }

    setLoading = value => {
      this.setState(({ isLoading }) =>
        isLoading === value ? null : { isLoading: value }
      );
    };

    fetchData = (args, request = mapPropsToRequest(args)) => {
      if (!isPromise(request)) return;

      if (this.timeout !== null) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      this.request = request;
      this.setLoading(true);
      request.then(
        data => {
          if (this.request === request) {
            this.setState({ args, data, isLoading: false, error: null }, () =>
              this.props.onFulfilled(data)
            );
          }
        },
        error => {
          if (this.request === request) {
            this.setState({ args, isLoading: false, error }, () =>
              this.props.onRejected(error)
            );
          }
        }
      );
    };

    updateData = () => this.fetchData();

    render() {
      const { render, component } = this.props;
      const renderProps = { ...this.state, updateData: this.updateData };

      if (render) return render(renderProps);

      return null;
    }
  };
}

export default createRequest;
