"""Geo helpers — extend with PostGIS / Shapely when boundary validation ships."""


def wkt_point(lat: float, lng: float) -> str:
    return f"POINT ({lng} {lat})"
