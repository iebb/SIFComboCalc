Storage.prototype.setObject = function(key, value) {this.setItem(key, JSON.stringify(value));}
Storage.prototype.getObject = function(key) {var value = this.getItem(key); return value && JSON.parse(value);}
var combo_weights = [1, 1.1, 1.15, 1.15, 1.2, 1.2, 1.2, 1.2, 1.25, 1.25, 1.25, 1.25, 1.3, 1.3, 1.3, 1.3, 1.35];

var lives = [];

var source   = $("#live-template").html();
var template = Handlebars.compile(source);


function select(data) { lives.push(data); redraw(); }

function redraw() {
	$('#lives').html('');
	for(var i=0;i<lives.length;i++) {
		lives[i].index = i;
		$('#lives').append(template(lives[i]));
	}
	docalc();
}


function move($this, delta) {
	moveId = $($this).parent().data("idx");
	if (moveId + delta >= 0 && moveId + delta < lives.length) {
		tmp = lives[moveId];
		lives[moveId] = lives[moveId + delta];
		lives[moveId + delta] = tmp;
	}
	redraw();
}
function remove($this) {
	moveId = $($this).parent().data("idx");
	lives.splice(moveId, 1);
	redraw();
}
function gtp(u) { return u.timing_sec + (u.effect == 3) * (u.effect_value); }


var calc_count = 0;
function docalc() {
	var d ="";
	for(var q=0;q<calc_count%10; q++) d+=".";
	$('#result').text("Downloading" + d);
	var find = 0;
	for(var i=0;i < lives.length;i++) {
		if (data = localStorage.getObject(lives[i].notes_setting_asset)) {
			lives[i].map = data;
			continue;
		}
		if ((typeof lives[i].downloading == 'undefined') || lives[i].downloading == 1) find = 1;
		if ((typeof lives[i].map == 'undefined') && (typeof lives[i].downloading == 'undefined')) {
			var p = i;
			find = 1;
			lives[p].downloading = 1;
			$.get('https://gitcdn.xyz/repo/iebb/SIFMaps/master/latest/' + lives[p].notes_setting_asset, 
				function(data) {
					lives[p].map = data;
					lives[p].downloading = 0;
					localStorage.setObject(lives[p].notes_setting_asset, data);
				}
			);
			break;
		}
	}
	if (find) {
		calc_count += 1;
		if (calc_count < 200) setTimeout(docalc, 100);
		else $('#result').text("Download Failed :(");
	} else {
		calc_count = 0;
		var combo = 0;
		var weighted = 0;
		var sp_weighted = [0,0,0,0,0,0,0,0,0,0];
		for(var i=0;i<lives.length;i++) {
			var map = lives[i].map;
			map.sort(function(a, b) {return gtp(a) != gtp(b) ? gtp(a) < gtp(b) ? -1 : 1: 0 ;});
			for(var p=0;p<map.length;p++) {
				var base = combo>800 ? 1.35 : combo_weights[parseInt(combo / 50)];
				if (map[p].effect == 3) {
					base *= 1.25;
				}
				combo++;
				weighted += base;
				sp_weighted[map[p].position] += base;
			}
		}
		for(var i=0;i<9;i++) $("#pos-" + i ).text(sp_weighted[9-i].toFixed(2))
		$('#result').text("Combo: " + weighted.toFixed(3));
	}
}


$('.typeahead').settingbox(select, $("#result-template").html());
for(var i=0;i<9;i++) $('.to-init').append("<td id='pos-" + i + "'>0.00</td>");