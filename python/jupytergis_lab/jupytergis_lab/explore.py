from pathlib import Path

from sidecar import Sidecar

from jupytergis_lab import GISDocument


def explore(
    geojson_path: str | Path,
    fresh_doc: bool = False,
) -> None:
    """Run a JupyterGIS data interaction interface alongside a Notebook.

    :param geojson_path: Path to a GeoJSON file.
    :param fresh_doc: Remove any pre-existing explore document before creating a new doc.
    """
    filename = "explore.jGIS"

    if fresh_doc:
        Path(filename).unlink(missing_ok=True)

    # FIXME: The document opens as intended, but the file has no contents and any
    #        updates performed result in no update to the file.
    doc = GISDocument(filename, open=True)

    # TODO: Basemap choices
    # TODO: Get basemap string from import
    doc.add_raster_layer(
        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
    )

    # TODO: Support all JGIS file types
    # TODO: Support Python objects like geodataframes, dataarrays, etc.
    doc.add_geojson_layer(str(geojson_path))

    # TODO: Zoom to layer; is that feasible to do from Python? Currently not exposed in
    #       Python API. Add e.g. `doc.add_geojson_layer(..., zoom_to=True)`
    #       How can we send this message to the JS side in the existing architecture? I
    #       think we need explicit comms.
