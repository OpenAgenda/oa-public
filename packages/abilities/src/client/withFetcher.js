import {
  compose, withStateHandlers, withHandlers, lifecycle
} from 'recompose';
import _ from 'lodash';

// Handle Rest API
function withFetcher( name, fetch, { fetchOnMount = false } = {} ) {
  return compose(
    withStateHandlers(
      {
        [ `${name}Fetcher` ]: {
          data: null,
          loading: fetchOnMount,
          error: null
        }
      },
      {
        [ `receive${_.upperFirst( name )}Data` ]: () => data => ( {
          [ `${name}Fetcher` ]: {
            data,
            loading: false,
            error: null
          }
        } ),
        [ `receive${_.upperFirst( name )}Error` ]: ( {
          [ `${name}Fetcher` ]: { data }
        } ) => error => ( {
          [ `${name}Fetcher` ]: {
            data,
            loading: false,
            error: error || true
          }
        } ),
        [ `start${_.upperFirst( name )}Fetch` ]: ( {
          [ `${name}Fetcher` ]: prevState
        } ) => () => ( {
          [ `${name}Fetcher` ]: {
            ...prevState,
            loading: true
          }
        } )
      }
    ),
    withHandlers( {
      [ `fetch${_.upperFirst( name )}` ]: props => () => {
        props[ `start${_.upperFirst( name )}Fetch` ]();
        fetch( props ).then(
          props[ `receive${_.upperFirst( name )}Data` ],
          props[ `receive${_.upperFirst( name )}Error` ]
        );
      }
    } ),
    // mapProps( props => _.omit( props, [
    //   `receive${_.upperFirst( name )}Data`,
    //   `receive${_.upperFirst( name )}Error`,
    //   `start${_.upperFirst( name )}Fetch`
    // ] ) ),
    fetchOnMount
      ? lifecycle( {
        componentDidMount() {
          this.props[ `fetch${_.upperFirst( name )}` ]();
        }
      } )
      : _.identity
  );
}

export default withFetcher;
