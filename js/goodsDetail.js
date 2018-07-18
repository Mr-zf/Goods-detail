var fenleiList = []; //规格分类list
var apiData = []; //接口数据，为了方便使用单独拎出来的。

var vm = new Vue({
	el: '#container',
	data: {
		isShowModel: false,
		goodsDetail: {},
		is11121: false,
		isShowDetail: false,
		userComment: {},    /* 用户评论 */
		minSale: '',  /* 购买最小 */
		hours: '',
		minutes: '',
		seconds: '',
		timer: '',
		isChooseGuige:false,  /* 是否已经选完规格 */
		fenleiList: [], //规格分类list
		select_fenlei_Id: [], //已选中的 类别的id
		isClick: false, //是否已经开始选择商品规格
		slt_one_good: null, //只选了一个规格时的 规格	
		get_guige_slt: {},
		/*  */
		guige_group_name: '',
		/* 选择后的规格组合 */
		readyChoose: [], //已选规格
		bigImgList: [], //可左右滑动的大图的list
	},
	filters: {
		formatMoney(value) {
			return "￥" + value
		}
	},
	created() {
		this.getGoods();
		this.isShow12();
	},
	methods: {
		//点击左上角缩略图,显示大图
		bigImgShowHandle() {
			$('.bigImg-box').addClass('bigImg-show');
		},
		isNoImg() {
			$('.bigImg-box').removeClass('bigImg-show');
		},
		ontouchmove() { /* 滑动事件 */
			//			console.log($('#img-top-loading').offset().top)
			if($('body').scrollTop() >= $(document).height() - $(window).height()) {
				this.isShowDetail = true;
				$('body').animate({
					scrollTop: '909px'
				}, 1500);

			}		

		},
		buyNow() { /*立即购买*/
			this.isShowModel = true;
			$('body').addClass('isHide')

		},
		sureBuy() { /*规格确定*/
			this.isShowModel = false;
			$('body').removeClass('isHide')
		},
		isShow12() { /* 显示11121 */
			this.is11121 = true;
			this.isTime();
			this.timer = setInterval(this.runHour, 1000);
		},
		isDialog(e) { /* 点击隐藏模态框 */
			if(e.target.id == 'container-model') {
				this.isShowModel = false;
				$('body').removeClass('isHide')
			}
		},
		isTime() {
			var start = new Date();

			var end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 18 * 60 * 60 * 1000 - 1);

			var cha = end - start; /*相差毫秒数*/

			var leave1 = cha % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
			var hours = Math.floor(leave1 / (3600 * 1000))

			//计算相差分钟数
			var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
			var minutes = Math.floor(leave2 / (60 * 1000))

			//计算相差秒数
			var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
			var seconds = Math.round(leave3 / 1000)

			if(seconds < 10 && seconds > 0) {
				seconds = "0" + seconds;
			}
			if(minutes < 10 && minutes > 0) {
				minutes = "0" + minutes;
			}
			if(hours < 10 && hours >= 0) {
				hours = "0" + hours;
			}

			this.hours = hours;
			this.minutes = minutes;
			this.seconds = seconds;
		},
		runHour() { /*  倒计时  */

			--this.seconds;

			//			console.log(this.seconds,this.minutes,this.hours)
			if(this.seconds < 10 && this.seconds > 0) {
				this.seconds = "0" + this.seconds;
			}

			if(this.seconds <= 0 && this.minutes > 0) {
				--this.minutes;
				if(this.minutes < 10 && this.minutes >= 0) {
					this.minutes = "0" + this.minutes;
				}
				this.seconds = 59;
			}
			if(this.minutes <= 0 && this.hours > 0) {
				--this.hours;
				if(this.hours < 10 && this.hours >= 0) {
					this.hours = "0" + this.hours;
				}
				this.minutes = 59;
			}

			if(this.hours <= 0 && this.minutes <= 0 && this.seconds <= 0) {
				
				this.is11121 = false;
				clearInterval(this.timer)
			}
		},
		itemClasses(scores) {
			let result = []; // 返回的是一个数组,用来遍历输出星星
			let score = Math.floor(scores * 2) / 2;
			let hasDecimal = score % 1 !== 0; // 非整数星星判断
			let integer = Math.floor(score); // 整数星星判断
			for(let i = 0; i < integer; i++) { // 整数星星使用on
				result.push("on"); // 一个整数星星就push一个CLS_ON到数组
			}
			while(result.length < 5) { // 余下的用无星星补全,使用off
				result.push("off");
			}

			return result;
		},

		/* sku */
		itemClick(index, item_id, event) {
			let that = event.target; //得到当前点击的元素
			let select_ids = []; //已经被选中 的节点集合
			let all_ids = []; //包含 已选节点路线数组
			this.isClick = true;
			let isSelect = false;
			//如果节点已经变成灰色，则不可以再被点击  -- 即不执行任何操作直接返回
			if(that.className.indexOf('disabled') > -1) {
				return;
			}

			//如果当前类别下，已选中此类别，则清除此类别
			if(this.select_fenlei_Id[index] == item_id) {
				this.$set(this.select_fenlei_Id, index, null);
				isSelect = true;
			} else { //否则 添加此类别
				this.$set(this.select_fenlei_Id, index, item_id);
				isSelect = false;
			}

			//获得已经被选中的节点
			select_ids = this.getSelAttrId();

			//将包含 已选节点路线 整合到一个数组
			all_ids = this.filterAttrs(select_ids);
			//						console.log(all_ids)

			this.isSelectHandel(all_ids, index, isSelect, select_ids)
			

			//判断是否已经选择一个完整的线路
			if(select_ids.length == all_ids.length) {
				//将已选择的路线 用','切割成字符串(便于比较)
				let sel_sku_id = all_ids.join(',');
				//循环遍历所有的线路，匹配出与已选线路相同的线路
				for(var i = 0; i < apiData.length; i++) {
					if(apiData[i].normsCombo.join(',') == sel_sku_id) {
						//已匹配出相同的路线，做相应的操作
						//1. 将价格更新为 匹配出路线的价格
						//2. 将左上角缩略图更新为 匹配出线路的图片,将已选规格补全
						this.get_guige_slt = apiData[i]
						
						//3. 将缩略图的大图的list更新为 匹配出路线的大图数组

						/********************************
				                     this.bigImgList = apiData[i].img;
				                                                                  本应利用vue渲染，但vue与swiper有冲突，在 vue注册的实例 el:'#main'范围内都不能使用swiper,
				                 	     所以在得到 大图的 数组后，利用JQ渲染
				                 	*********************************/

						let bigHtml = '';
						for(let m in apiData[i].img) {
							bigHtml += '<div class="swiper-slide">';
							bigHtml += '<img src="' + apiData[i].img[m] + '">'
							bigHtml += '</div>';
						}

						//追加到 swiper-wrapper 里
						$('.swiper-wrapper').html(bigHtml);
						//启动swiper
						var swiper = new Swiper('.bigImg-box .swiper-container', {
							pagination: { //分页器
								el: '.swiper-pagination',
								type: 'fraction',
							},
							effect: 'auto', 
						});
						// 是否选完规格为true
						this.isChooseGuige = true;
					}
				}
			}else if(select_ids.length==0){  /* 如果当前没有选中规格 */
				this.get_guige_slt = apiData[0];
				this.isChooseGuige = false;
			}
		},
		//获得已选中的 规格类别 id
		getSelAttrId() {

			var list = [];
			for(let k in this.select_fenlei_Id) {
				if(this.select_fenlei_Id[k] != null) {
					list.push(this.select_fenlei_Id[k]);
				}
			}
			return list;
		},
		//获取 经过已选节点 所有线路上的全部节点，并将其组成数组，根据已经选择得属性值，得到余下还能选择的属性值
		filterAttrs(select_ids) {
			var result = []; //所有路线的节点集合
			//获得 包含已选节点的所有路线
			var routes = this.filterRoute(select_ids);
			//将所有 路线 拼成一个数组
			for(var i = 0; i < routes.length; i++) {
				result = result.concat(routes[i].split(','));
			}
			return result;
		},
		//获取  所有包含指定节点的路线
		filterRoute(select_ids) {
			var result = []; //包含所有路线的集合
			//遍历所有路线，并判断是否包含已选中的节点 normsCombo
			for(var i = 0; i < apiData.length; i++) {
				let tmpAttr = ';' + apiData[i].normsCombo.join(';') + ';';
				let all_ids_in = true;
				for(k in select_ids) {
					if(tmpAttr.indexOf(';' + select_ids[k] + ';') == -1) {
						all_ids_in = false;
						break;
					}
				}
				if(all_ids_in) {
					result.push(apiData[i].normsCombo.join(','));
				}
			}
			return result;
		},
		//判断 类别是否可以被选择
		isSelectHandel(all_ids, index, isSelect, select_ids) {
			//遍历所有类别
			for(let k in this.fenleiList) {
				let tmpList = this.fenleiList[k][1];
				let tmpIndex = 1000;
				let tmp_tmpIndex = [];
				//现在是从多种选择的状态下，只剩下一种类别被选中
				if(isSelect && select_ids.length == 1) {
					for(let s in this.select_fenlei_Id) {
						//直选中一个类别的情况下，此类别的其他类别也可以被点击
						if(this.select_fenlei_Id[s]) {
							tmpIndex = parseInt(s);
						}
					}
				} else if(isSelect && (select_ids.length > 1 && select_ids.length < this.fenleiList.length)) { //现在是从多种选择的状态下，只剩下种类别被选中
					let initIndexList = [];
					for(let s in this.select_fenlei_Id) {
						//直选中一个类别的情况下，此类别的其他类别也可以被点击
						if(this.select_fenlei_Id[s]) {
							initIndexList.push(parseInt(s));
						}
					}
					//初始化所有的类别 为可选状态
					for(let tmp_k in this.fenleiList) {
						let tmp_tmpList = this.fenleiList[tmp_k][1];
						for(let tmp_k_child in tmp_tmpList) {
							var obj = {
								id: tmp_tmpList[tmp_k_child].id,
								name: tmp_tmpList[tmp_k_child].name,
								isSlt: true
							};
							this.$set(this.fenleiList[tmp_k][1], tmp_k_child, obj);
						}
					}
					let tmp_select_ids = [];
					for(let init in initIndexList) {
						tmp_select_ids.push(select_ids[init]);
						let tmp_all_ids = this.filterAttrs(tmp_select_ids);
						//根据 初始化的 路线Id重新判断 类别是否可选
						this.isSelectHandel(tmp_all_ids, initIndexList[init], false, tmp_select_ids);
					}
					break;
				} else if(!isSelect && index == k) {
					continue;
				}
				//遍历类别下 所有的子类
				for(let k_child in tmpList) {
					let isContain = false;
					if(tmpIndex == k) {
						isContain = true;
					} else { //判断所有 路线中，是否包含当前的类别
						for(let t in all_ids) {
							//如果不包含，则禁止选择
							if(all_ids[t] == tmpList[k_child].id) {
								isContain = true;
								break;
							}
						}
					}
					var obj = {
						id: tmpList[k_child].id,
						name: tmpList[k_child].name,
						isSlt: isContain
					};
					this.$set(this.fenleiList[k][1], k_child, obj);
				}
			}
		},

		//获得所有分类的 list
		getFenLeiList(data) {
			//			console.log(data)
			//遍历所有的 norms
			for(let k in data) {
				//当前   morms 中的 norms
				let tmpList = data[k].norms;
				//data[k].norms : 里面有三个对象，分别对应三个类别；也有可能是两个或一个对象 分别 对应两个或一个类别。
				//                即所有的第一个对象都是一种类别，所有的第二个对象都是第二种类别。。。依次类推

				//遍历当前数据的 norms,即当前 norms 中包含的 norms
				for(let t in tmpList) {
					if(!this.isContainFenLei(tmpList[t].groupName)) {
						// 索引 t 处的类别名称 和 编号
						var obj = [{
								groupId: tmpList[t].groupId,
								groupName: tmpList[t].groupName
							},
							[{
								id: tmpList[t].id,
								name: tmpList[t].name,
								isSlt: true
							}]
						];
						this.fenleiList.push(obj)
					} else {
						//当前类别的索引
						let index = this.getFenLeiIndex(tmpList[t].groupName);
						//判断当前大类别下,是否已经包含 此子类别
						if(!this.isContainFenLeiChild(index, tmpList[t].id)) {
							//追加当前类别的子类别
							this.fenleiList[index][1].push({
								id: tmpList[t].id,
								name: tmpList[t].name,
								isSlt: true
							})
						}
					}
				}
			}
		},
		//判断 是否 已经 有此 分类						
		isContainFenLei(groupName) {
			for(let k in this.fenleiList) {
				if(this.fenleiList[k][0].groupName == groupName) {
					return true;
				}
			}
			return false;
		},
		//获得当前类别的索引
		getFenLeiIndex(groupName) {
			for(let k in this.fenleiList) {
				if(this.fenleiList[k][0].groupName == groupName) {
					return k;
				}
			}
			return 0;
		},
		//判断  此分类是否 已经 包含该此子分类					
		isContainFenLeiChild(index, id) {
			let tmp = this.fenleiList[index][1];
			for(let t in tmp) {
				if(tmp[t].id == id) {
					return true;
				}
			}
			return false;
		},

		chooseSale(sale) {
			if(sale == 'jian') {
				this.goodsDetail.minSale--;
				if(this.goodsDetail.minSale <= this.minSale) {
					this.goodsDetail.minSale = this.minSale;
				}
			} else {
				this.goodsDetail.minSale++;
			}

		},
		getGoods() {/*请求*/
			axios.get('http://test.yiyousu.com/goods/6/1019') /* 1019 */
				.then((res) => {
					this.goodsDetail = res.data.data.list;
					this.minSale = this.goodsDetail.minSale;
					this.userComment = res.data.data.list.comment;
					apiData = res.data.data.list.norms;
					this.get_guige_slt = apiData[0];
					console.log(apiData);
					let bigHtml = '';
					for(let m in apiData[0].img) {
						bigHtml += '<div class="swiper-slide">';
						bigHtml += '<img src="' + apiData[0].img[m] + '">'
						bigHtml += '</div>';
					}

					//追加到 swiper-wrapper 里
					$('.swiper-wrapper').html(bigHtml);
					// 启动详情页大图滑动
					var swiper = new Swiper('.swiper-container-top .swiper-container', {
						pagination: { //分页器
							el: '.swiper-container-top .swiper-pagination',
							type: 'fraction', //'fraction' -- 数字 , 'bullets'-圆点  , 'progressbar' -- 进度条
						},
						effect: 'auto', //切换效果'auto' -- 默认 , 'cube' -- 立方体 , 'coverflow' -- 折纸
					});

					// 默认小图点击查看滑动
					var swiper = new Swiper('.bigImg-box .swiper-container', {
						pagination: { //分页器
							el: '.bigImg-box .swiper-pagination',
							type: 'fraction',
						},
						effect: 'auto',
					});

					this.getFenLeiList(apiData);
				})
		}
	}
})