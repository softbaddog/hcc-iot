var Node = require('mongoose').model('Node');

// { "online": [] }
// { "online": [ "FFFF010203FCE000"] }
// { "online": [ "FFFF010203FCE000", "2E00000000000031", "2E00000000000030" ] }
exports.devStatus = function(devices, node) {
	if (node) {
		node.status = devices.online[0] === node.deviceId ? 1 : 0;
		node.updated = new Date();
		node.save(function(err) {
			if (!err) {
				console.log(node.name, node.status);
				io.emit('nodeChanged', node);
				io.emit('onlineChanged', node);
			}
		});
	} else {
		if (devices.online.length > 0) {
			devices.online.forEach(function(element) {
				Node.findOne({
					deviceId: element
				}).exec(function(err, node) {
					if (err) {
						return err;
					}

					if (!node) {
						return new Error('非法deviceId ' + element);
					}

					node.status = 1;
					node.updated = new Date();
					node.save(function(err) {
						if (!err) {
							console.log(node.name);
							io.emit('nodeChanged', node);
							io.emit('onlineChanged', node);
						}
					});
				});
			});
		}
	}
};

// []
// [ 
// { "device-id": "FFFF010203FCE000", "status": "online", "node-id": 1, "parent-node-id": 0, "hop-count": 0 }, 
// { "device-id": "2E00000000000030", "status": "online", "node-id": 2, "parent-node-id": 1, "hop-count": 1 }, 
// { "device-id": "2E00000000000032", "status": "online", "node-id": 3, "parent-node-id": 1, "hop-count": 1 } 
// ]
exports.devMap = function(devices, callback) {
	if (devices.length > 0) {
		devices.forEach(function(element) {
			Node.findOne({
				deviceId: element.deviceid
			}, function(err, node) {
				if (err) {
					return err;
				}

				if (!node) {
					return new Error('非法deviceId ' + element);
				}
				callback(element.nodeid, node.name);
			});
		});
	}
};

exports.devTopo = function(devices, map) {
	if (devices.length > 0) {
		devices.forEach(function(element) {
			if (element.parentnodeid === 0) {
				return;
			}
			Node.findOne({
				deviceId: element.deviceid
			}).exec(function(err, node) {
				if (err) {
					return err;
				}

				if (!node) {
					return new Error('非法deviceId ' + element);
				}

				node.parent = map[element.parentnodeid];
				node.updated = new Date();
				node.save(function(err) {
					if (!err) {
						console.log(node.name);
						io.emit('nodeChanged', node);
						io.emit('onlineChanged', node);
					}
				});
			});
		});
	}
};

// { "a-voltage": 0 }
exports.devVoltage = function(voltage, node) {
	node.params.voltage = voltage.avoltage;
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.voltage);
			io.emit('nodeChanged', node);
		}
	});
};

// { "a-current": 0 }
exports.devCurrent = function(current, node) {
	node.params.current = current.acurrent;
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.current);
			io.emit('nodeChanged', node);
		}
	});
};

// { "total-active-power": 0 }
exports.devPower = function(power, node) {
	node.params.power = power.totalactivepower;
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.power);
			io.emit('nodeChanged', node);
		}
	});
};

// { "frequency": 0 }
exports.devFrequency = function(frequency, node) {
	node.params.frequency = frequency.frequency;
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.frequency);
			io.emit('nodeChanged', node);
		}
	});
};

// { "total-active-energy": 0 }
exports.devEnergy = function(energy, node) {
	node.params.energy = energy.totalactiveenergy;
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.energy);
			io.emit('nodeChanged', node);
		}
	});
};

// [2]
exports.devGroup = function(group, node) {
	node.params.group = group[0];
	node.updated = new Date();
	node.save(function(err) {
		if (!err) {
			console.log(node.name, node.params.group);
			io.emit('nodeChanged', node);
		}
	});
};

// [{"index":0,"status":"on"}]
exports.devSwitch = function(devices, node) {
	if (devices.length > 0) {
		node.switch = devices[0].status === 'on' ? 1 : 0;
		node.updated = new Date();
		node.save(function(err) {
			if (!err) {
				console.log(node.name, node.switch);
				io.emit('nodeChanged', node);
			}
		});
	}
}

// [{"index":0,"level":0}]
exports.devLevel = function(devices, node) {
	if (devices.length > 0) {
		node.level = devices[0].level;
		node.updated = new Date();
		node.save(function(err) {
			if (!err) {
				console.log(node.name, node.level);
				io.emit('nodeChanged', node);
			}
		});
	}
}

// Received: '{"type":"huawei-iotdm-device-common:online-status-change","data":{"online-status":"offline"},"gateway":"000D6
// F00052AE47E","timestamp":"2016-08-15T15:27:55Z","esn":"2E00216EFC000255"}'
// Received: '{"type":"huawei-iotdm-device:data-report","data":{"huawei-iotdm-device-common:online-status":"offline","huawe
// i-iotdm-device-common:offline-reason":"normal"},"gateway":"000D6F00052AE47E","timestamp":"2016-08-15T15:27:55Z","esn":"2
// E00216EFC000255"}'


// Received: '{"type":"huawei-iotdm-device-common:online-status-change","data":{"on
// line-status":"online"},"gateway":"000D6F00052AE47E","timestamp":"2016-08-15T15:2
// 6:02Z","esn":"2E00216EFC000255"}'
exports.devStatusChanged = function(status, deviceId) {
	Node.findOne({
		deviceId: deviceId
	}).exec(function(err, node) {
		if (err) {
			return err;
		}

		if (!node) {
			return new Error('非法deviceId ' + element);
		}

		if (node.status !== status) {
			node.status = status;

			node.updated = new Date();
			node.save(function(err) {
				if (!err) {
					console.log(node.name, node.status);
					io.emit('nodeChanged', node);
					io.emit('onlineChanged', node);
				}
			});			
		}
	});
}
