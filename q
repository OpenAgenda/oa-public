[1mdiff --git a/packages/home/src/client/containers/Agendas.js b/packages/home/src/client/containers/Agendas.js[m
[1mindex 25f4b6b..3552cd6 100644[m
[1m--- a/packages/home/src/client/containers/Agendas.js[m
[1m+++ b/packages/home/src/client/containers/Agendas.js[m
[36m@@ -94,7 +94,7 @@[m [mexport default class Agendas extends Component {[m
   };[m
 [m
   render() {[m
[31m-    const { isNew, loading, query, res, total, history } = this.props;[m
[32m+[m[32m    const { isNew, loading, query, total } = this.props;[m
 [m
     if ( isNew && !total ) {[m
       return <Welcome />[m
[36m@@ -108,7 +108,6 @@[m [mexport default class Agendas extends Component {[m
       <div className="content">[m
         <AgendasSearch[m
           id="homeAgendas"[m
[31m-          fieldIsVisible={() => query.search}[m
           getTitleLink={this.getAgendaTitleLink}[m
           Header={this.renderHeader}[m
           AgendaActionsComponent={this.renderAgendaActions}[m
[1mdiff --git a/packages/home/src/client/containers/AgendasSearch.js b/packages/home/src/client/containers/AgendasSearch.js[m
[1mindex 5854e51..9eabb90 100644[m
[1m--- a/packages/home/src/client/containers/AgendasSearch.js[m
[1m+++ b/packages/home/src/client/containers/AgendasSearch.js[m
[36m@@ -40,7 +40,6 @@[m [mexport default class AgendasSearch extends Component {[m
     listLoading: PropTypes.bool,[m
     nextLoading: PropTypes.bool,[m
     perPageLimit: PropTypes.number,[m
[31m-    fieldIsVisible: PropTypes.func,[m
     getTitleLink: PropTypes.func,[m
     createButtonIfEmpty: PropTypes.bool[m
   };[m
[36m@@ -51,8 +50,7 @@[m [mexport default class AgendasSearch extends Component {[m
 [m
   static defaultProps = {[m
     Header: () => null,[m
[31m-    AgendaActionsComponent: () => null,[m
[31m-    fieldIsVisible: () => true[m
[32m+[m[32m    AgendaActionsComponent: () => null[m
   };[m
 [m
   state = {[m
[36m@@ -67,21 +65,28 @@[m [mexport default class AgendasSearch extends Component {[m
     this.mounted = false;[m
   }[m
 [m
[31m-  search = value => {[m
[31m-    if ( this.mounted ) {[m
[31m-      this.setState( { value } );[m
[31m-[m
[31m-      this.props.list( this.props.id, { search: value } )[m
[31m-        .then( () => {[m
[31m-          if ( this.props.onSearch ) {[m
[31m-            return this.props.onSearch( value );[m
[31m-          }[m
[31m-        } );[m
[31m-    }[m
[32m+[m[32m  search = () => {[m
[32m+[m[32m    this.props.list( this.props.id, { search: this.state.value } )[m
[32m+[m[32m      .then( () => {[m
[32m+[m[32m        if ( this.props.onSearch ) {[m
[32m+[m[32m          this.props.onSearch( this.state.value );[m
[32m+[m[32m        }[m
[32m+[m[32m      } );[m
   };[m
 [m
   debouncedSearch = debounce( this.search, 400 );[m
 [m
[32m+[m[32m  onSearch = value => {[m
[32m+[m[32m    if ( this.mounted ) {[m
[32m+[m[32m      this.setState( {[m
[32m+[m[32m        previousValue: this.state.value,[m
[32m+[m[32m        value[m
[32m+[m[32m      }, () => {[m
[32m+[m[32m        this.debouncedSearch();[m
[32m+[m[32m      } );[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m
   nextPage = () => {[m
     const { page, total, loading, listLoading, nextLoading, agendas, perPageLimit } = this.props;[m
     const { value } = this.state;[m
[36m@@ -91,6 +96,17 @@[m [mexport default class AgendasSearch extends Component {[m
 [m
   throttledNextPage = throttle( this.nextPage, 400, { trailing: false } );[m
 [m
[32m+[m[32m  fieldIsVisible = () => {[m
[32m+[m[32m    const { total, perPageLimit } = this.props;[m
[32m+[m[32m    const { value, previousValue } = this.state;[m
[32m+[m
[32m+[m[32m    return ([m
[32m+[m[32m      (value && value !== '')[m
[32m+[m[32m      || (previousValue && previousValue !== '')[m
[32m+[m[32m      || total > perPageLimit[m
[32m+[m[32m    );[m
[32m+[m[32m  };[m
[32m+[m
   render() {[m
     const {[m
       id,[m
[36m@@ -98,29 +114,25 @@[m [mexport default class AgendasSearch extends Component {[m
       agendas,[m
       listLoading,[m
       nextLoading,[m
[31m-      fieldIsVisible,[m
[31m-      perPageLimit,[m
[31m-      total,[m
       getTitleLink,[m
       AgendaActionsComponent,[m
       createButtonIfEmpty,[m
       res,[m
       initialValues[m
     } = this.props;[m
[31m-    const { value } = this.state;[m
     const { getLabel } = this.context;[m
 [m
     return ([m
       <AgendasSearchComponent[m
         form={id}[m
         Header={Header}[m
[31m-        search={this.debouncedSearch}[m
[32m+[m[32m        search={this.onSearch}[m
         nextPage={this.throttledNextPage}[m
         agendas={agendas}[m
         listLoading={listLoading}[m
         nextLoading={nextLoading}[m
         getLabel={getLabel}[m
[31m-        fieldIsVisible={() => ((value && value !== '') || fieldIsVisible() || total > perPageLimit)}[m
[32m+[m[32m        fieldIsVisible={this.fieldIsVisible}[m
         getTitleLink={getTitleLink}[m
         AgendaActionsComponent={AgendaActionsComponent}[m
         agendaCreateRes={res.agendas.create}[m
