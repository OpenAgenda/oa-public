import Style from '../../Style.js';

// The root repeats its class: React hoists this sheet before the page
// stylesheets, so it has to outrank consumer classes on specificity rather than
// on order. The `.marker-cluster` and gesture-handling rules below already
// outrank leaflet's own single-class ones.
const css = `
.oa-filters-map.oa-filters-map {
  height: 100%;
}

.oa-filters-map .marker-cluster-small {
  background-color: rgba(181, 226, 140, 0.6);
}

.oa-filters-map .marker-cluster-small div {
  background-color: rgba(110, 204, 57, 0.6);
}

.oa-filters-map .marker-cluster-medium {
  background-color: rgba(241, 211, 87, 0.6);
}

.oa-filters-map .marker-cluster-medium div {
  background-color: rgba(240, 194, 12, 0.6);
}

.oa-filters-map .marker-cluster-large {
  background-color: rgba(253, 156, 115, 0.6);
}

.oa-filters-map .marker-cluster-large div {
  background-color: rgba(241, 128, 23, 0.6);
}

.oa-filters-map .marker-cluster {
  background-clip: padding-box;
  border-radius: 20px;
}

.oa-filters-map .marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 15px;
  font: 12px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}

.oa-filters-map .marker-cluster span {
  line-height: 30px;
}

.oa-filters-map.leaflet-gesture-handling:after {
  color: #fff;
  font-family: Roboto, Arial, sans-serif;
  font-size: 22px;
  justify-content: center;
  display: flex;
  align-items: center;
  padding: 15px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1001;
  pointer-events: none;
  text-align: center;
  transition: opacity .8s ease-in-out;
  opacity: 0;
  content: "";
}

.oa-filters-map.leaflet-gesture-handling-warning:after {
  transition-duration: .3s;
  opacity: 1;
}

.oa-filters-map.leaflet-gesture-handling-touch:after {
  content: attr(data-gesture-handling-touch-content);
}

.oa-filters-map.leaflet-gesture-handling-scroll:after {
  content: attr(data-gesture-handling-scroll-content);
}
`;

export default function MapStyle() {
  return <Style name="mapStyle">{css}</Style>;
}
