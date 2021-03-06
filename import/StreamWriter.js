const iconv = require('iconv-lite');
const stream = require('stream');
const couchbase = require('couchbase');



class WriterStream extends stream.Writable {
  constructor(  cbCluster = new couchbase.Cluster('couchbase://127.0.0.1:8091'),
                bucket = 'medicaments') {
    super({
      objectMode: true
    });
    this.bucket = cbCluster.openBucket(bucket);
  }

  _write(chunk, encoding, callback) {
    const { key, data } = chunk
    const bucket = this.bucket;
    if(key) {
      bucket.get(data.cis, (err, res) => {
        if(err) {
          if(err.code !== 13) {
            return callback(err)
          }
          return bucket.upsert(data.cis, addTheData({cis: data.cis}, key, data), callback);
        }
        const newObject = addTheData(res.value, key, data)
        bucket.upsert(data.cis, newObject, {cas: res.cas},  callback);
      });
    } else {
      bucket.upsert(data.cis, data, callback);
    }
  }
}

function addTheData(oldValue, key, data) {
  const newObject = oldValue
  if(key.type === 'array') {
    if(!newObject[key.name]) {
      newObject[key.name] = []
    }
    newObject[key.name].push(data)
  } else {
    newObject[key.name] = data
  }
  return newObject
}

module.exports = WriterStream
