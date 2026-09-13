import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  SERVICE_AREAS,
  WEST_BERKELEY_VIEW,
  boundsForServiceArea,
  searchServiceAreas,
  serviceAreaFeatureCollection,
  serviceAreaLabelCollection
} from "./map-data.mjs";

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const RESULT_PAGE_SIZE = 12;
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

function RangeButton({ area, selected, onSelect }) {
  return (
    <button
      className={`range-button${selected ? " is-active" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(area.id)}
    >
      <span className="range-number">{area.addressRange}</span>
      <span className="range-street">{area.streetName}</span>
      <span className="range-bounds">
        {area.startStreet && area.endStreet
          ? `${area.startStreet} → ${area.endStreet}`
          : `Addresses ${area.addressMin}–${area.addressMax}`}
      </span>
    </button>
  );
}

export function WestBerkeleyMap({ selectedBlock, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const previousSelectionRef = useRef(selectedBlock);
  const [query, setQuery] = useState("");
  const [resultLimit, setResultLimit] = useState(RESULT_PAGE_SIZE);
  const [mapStatus, setMapStatus] = useState("loading");
  const results = useMemo(() => searchServiceAreas(query), [query]);
  const orderedResults = useMemo(() => {
    if (query) return results;
    const selected = results.find(({ id }) => id === selectedBlock);
    return selected ? [selected, ...results.filter(({ id }) => id !== selectedBlock)] : results;
  }, [query, results, selectedBlock]);
  const visibleResults = orderedResults.slice(0, resultLimit);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { setResultLimit(RESULT_PAGE_SIZE); }, [query]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    let ready = false;
    let map;
    const loadTimeout = window.setTimeout(() => {
      if (!ready) setMapStatus("error");
    }, 12000);
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: WEST_BERKELEY_VIEW.center,
        zoom: WEST_BERKELEY_VIEW.zoom,
        maxBounds: WEST_BERKELEY_VIEW.maxBounds,
        minZoom: 11.8,
        maxZoom: 19,
        attributionControl: false,
        cooperativeGestures: true
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      map.once("style.load", () => {
        ready = true;
        window.clearTimeout(loadTimeout);
        map.addSource("service-areas", {
          type: "geojson",
          data: serviceAreaFeatureCollection(selectedBlock)
        });
        map.addSource("service-area-labels", {
          type: "geojson",
          data: serviceAreaLabelCollection(selectedBlock)
        });
        map.addLayer({
          id: "service-area-halo",
          type: "line",
          source: "service-areas",
          paint: {
            "line-color": "#fffefa",
            "line-width": ["case", ["get", "selected"], 13, 6],
            "line-opacity": ["case", ["get", "selected"], 0.95, 0.66]
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
        map.addLayer({
          id: "service-area-lines",
          type: "line",
          source: "service-areas",
          paint: {
            "line-color": ["case", ["get", "selected"], "#df5b46", "#2f713b"],
            "line-width": ["case", ["get", "selected"], 8, 3],
            "line-opacity": ["case", ["get", "selected"], 0.96, 0.72]
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
        map.addLayer({
          id: "service-area-dots",
          type: "circle",
          source: "service-area-labels",
          minzoom: 14.2,
          paint: {
            "circle-radius": ["case", ["get", "selected"], 16, 11],
            "circle-color": ["case", ["get", "selected"], "#df5b46", "#2f713b"],
            "circle-stroke-color": "#fffefa",
            "circle-stroke-width": 3
          }
        });
        map.addLayer({
          id: "service-area-label-text",
          type: "symbol",
          source: "service-area-labels",
          minzoom: 14.2,
          layout: {
            "text-field": ["get", "addressRange"],
            "text-size": 11,
            "text-font": ["Noto Sans Bold"],
            "text-allow-overlap": true
          },
          paint: { "text-color": "#ffffff" }
        });

        const chooseFeature = (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (id) onSelectRef.current(id);
        };
        for (const layer of ["service-area-lines", "service-area-dots", "service-area-label-text"]) {
          map.on("click", layer, chooseFeature);
          map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
        }
        setMapStatus("ready");
      });
      map.on("error", () => {
        if (!ready) setMapStatus("error");
      });
    } catch {
      setMapStatus("error");
    }

    return () => {
      window.clearTimeout(loadTimeout);
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "ready") return;
    map.getSource("service-areas")?.setData(serviceAreaFeatureCollection(selectedBlock));
    map.getSource("service-area-labels")?.setData(serviceAreaLabelCollection(selectedBlock));
    const area = SERVICE_AREAS.find(({ id }) => id === selectedBlock);
    if (area && previousSelectionRef.current !== selectedBlock) {
      map.fitBounds(boundsForServiceArea(area), {
        padding: { top: 80, right: 90, bottom: 80, left: 90 },
        maxZoom: 16.8,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650
      });
    }
    previousSelectionRef.current = selectedBlock;
  }, [selectedBlock, mapStatus]);

  function submitSearch(event) {
    event.preventDefault();
    if (results.length === 1) onSelect(results[0].id);
  }

  function showWestBerkeley() {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      center: WEST_BERKELEY_VIEW.center,
      zoom: WEST_BERKELEY_VIEW.zoom,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650
    });
  }

  return (
    <section className="map-explorer" aria-label="West Berkeley range finder">
      <form className="map-search" role="search" onSubmit={submitSearch}>
        <label htmlFor="range-search">Search supported ranges</label>
        <div className="map-search-control">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m12.5 12.5 4 4" /></svg>
          <input
            id="range-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “2127 9th” or “Cedar”"
            autoComplete="off"
          />
          <button type="submit">Find</button>
        </div>
        <p className="map-search-note">Search stays in your browser.</p>
      </form>

      <div className={`map-stage map-${mapStatus}`}>
        <div
          className="map-canvas"
          ref={containerRef}
          role="region"
          aria-label="Interactive map of West Berkeley with supported community reporting ranges"
        />
        {mapStatus === "loading" && <p className="map-message" role="status">Loading West Berkeley map…</p>}
        {mapStatus === "error" && <p className="map-message map-error" role="status"><strong>Map unavailable.</strong> Choose a live range below.</p>}
        {mapStatus === "ready" && <button className="map-home" type="button" onClick={showWestBerkeley}>West Berkeley</button>}
        <div className="map-legend" aria-hidden="true">
          <span><i className="legend-line" />Live range</span>
          <span><i className="legend-dot" />Selected</span>
        </div>
      </div>

      <div className="map-search-results" aria-live="polite">
        <div className="range-list-heading">
          <strong>{query ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : "West Berkeley ranges"}</strong>
          <span>City centerlines on or west of San Pablo Avenue.</span>
        </div>
        {results.length ? (
          <>
            <div className="range-list">
              {visibleResults.map((area) => (
                <RangeButton area={area} selected={area.id === selectedBlock} onSelect={onSelect} key={area.id} />
              ))}
            </div>
            {visibleResults.length < orderedResults.length && (
              <button
                className="range-show-more"
                type="button"
                onClick={() => setResultLimit((limit) => limit + RESULT_PAGE_SIZE)}
              >
                Show more <span>{orderedResults.length - visibleResults.length} remaining</span>
              </button>
            )}
          </>
        ) : (
          <p className="empty-search">No live community range matches that search yet.</p>
        )}
      </div>
    </section>
  );
}
