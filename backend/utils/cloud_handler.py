import gzip
import io
import os
from typing import Callable

import requests
from carball.analysis.utils import pandas_manager, proto_manager

from backend.blueprints.spa_api.errors.errors import ReplayNotFound

try:
    from config import PARSED_BUCKET, PROTO_BUCKET, REPLAY_BUCKET, FAILED_BUCKET
except:
    PARSED_BUCKET = None
    PROTO_BUCKET = None
    REPLAY_BUCKET = None
    FAILED_BUCKET = None

try:
    from google.cloud import storage
except:
    print("Google Cloud Storage is not installed. Install it with `pip install google-cloud-storage`")
    storage = None



try:
    import config

    GCP_URL = config.GCP_URL
    CLOUD_THRESHOLD = config.CLOUD_THRESHOLD
except:
    print('Not using GCP')
    GCP_URL = None
    CLOUD_THRESHOLD = 100  # threshold of queue size for cloud parsing


class GCPManager:
    @staticmethod
    def get_gcp_url():
        return GCP_URL

    @staticmethod
    def should_go_to_gcp(get_queue_length: Callable):
        lengths = get_queue_length()  # priority 0,3,6,9
        return lengths[1] > CLOUD_THRESHOLD and GCPManager.get_gcp_url() is not None


def download_proto(id_):
    if PROTO_BUCKET is None:
        raise ReplayNotFound()
    # PROTO
    pts_url = f'https://storage.googleapis.com/{PROTO_BUCKET}/{id_}.replay.pts'
    r = requests.get(pts_url)
    if r.status_code == 404:
        raise ReplayNotFound()
    with io.BytesIO(r.content) as f:
        protobuf_game = proto_manager.ProtobufManager.read_proto_out_from_file(f)
    return protobuf_game


def upload_proto(filepath, blob_name=None):
    if blob_name is None:
        blob_name = os.path.basename(filepath)
    return upload_to_bucket(blob_name, filepath, PROTO_BUCKET)


def download_df(id_):
    if PARSED_BUCKET is None:
        raise ReplayNotFound()
    gzip_url = f'https://storage.googleapis.com/{PARSED_BUCKET}/{id_}.replay.gzip'
    r = requests.get(gzip_url)
    if r.status_code == 404:
        raise ReplayNotFound()
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(r.content)) as f:
            data_frame = pandas_manager.PandasManager.read_numpy_from_memory(f)
    except:
        with io.BytesIO(r.content) as f:
            data_frame = pandas_manager.PandasManager.read_numpy_from_memory(f)
    return data_frame


def upload_df(filepath, blob_name=None):
    if blob_name is None:
        blob_name = os.path.basename(filepath)
    return upload_to_bucket(blob_name, filepath, PARSED_BUCKET)


def download_replay(id_):
    if PROTO_BUCKET is None:
        raise ReplayNotFound()
    # PROTO
    replay_url = f'https://storage.googleapis.com/{REPLAY_BUCKET}/{id_}.replay'
    r = requests.get(replay_url)
    if r.status_code == 404:
        raise ReplayNotFound()
    with io.BytesIO(r.content) as f:
        return f


def upload_replay(filepath, blob_name=None):
    if blob_name is None:
        blob_name = os.path.basename(filepath)
    return upload_to_bucket(blob_name, filepath, REPLAY_BUCKET)


def upload_failed_replay(filepath, blob_name=None):
    if blob_name is None:
        blob_name = os.path.basename(filepath)
    return upload_to_bucket(blob_name, filepath, FAILED_BUCKET)


def upload_to_bucket(blob_name, path_to_file, bucket_name):
    """Upload data to bucket.

    :param blob_name: Name of the file object on the bucket
    :param path_to_file:
    :param bucket_name:
    :return:
    """
    if storage is None:
        return

    # Explicitly use service account credentials by specifying the private key
    # file.
    storage_client = storage.Client.from_service_account_json('creds.json')
    # print(buckets = list(storage_client.list_buckets())

    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(path_to_file)

    # returns a public url
    return blob.public_url