(function () {
	var d = document;
	window.CHAT = {
		msgObj:document.getElementById("message"),
		screenheight:window.innerHeight ? window.innerHeight : dx.clientHeight,
		username:null,
		userid:null,
		socket:null,
		//让浏览器滚动条保持在最低部
		scrollToBottom:function(){
			window.scrollTo(0, this.msgObj.clientHeight);
		},
		//退出，本例只是一个简单的刷新
		logout:function(){
			//this.socket.disconnect();
			location.reload();
		},
		//提交聊天消息内容
		submit:function(){
				var content = $("#content").val();
                var faces = new Array('微笑', '色', '亲亲', '得意', '流泪', '害羞', '闭嘴', '鼓掌', '大哭', '尴尬', '生气', '调皮', '呲牙', '惊讶', '委屈', '吐血', '冷汗', '抓狂', '难过', '偷笑', '白眼', '不屑', '快哭了', '困', '装酷', '大笑', '偷瞄', '奋斗', '咒骂', '疑问', '晕', '捶打', '再见', '抠鼻', '发呆', '坏笑', '哈欠','鄙视','睡觉','饿','阴险','难受','可怜','撇嘴','石化','泪眼');
            	for(var i=0;i<faces.length;i++){
            		if(content.indexOf(faces[i])>-1){
            			 var reg = RegExp(faces[i] , 'g');
            			 content = content.replace(reg, '<img src="img/images/face_'+ (i >= 9 ? (i + 1) : ('0' + (i + 1)))  +'.png">');
                        }
                 }
            $("#bqing").css({"display":"none"});
			$("#input-box").css({"bottom":"0px"});
			/*//将表情循环插入页面中
				function IF(content) {	
					for(var i=1;i<num;i++){
						var str="img/images/face_"+(i >= 9 ? (i + 1) : ('0' + (i + 1))) +".png";
                        $("#content").append("<img src="+str+" />");
					}
				}*/
			if(content != ''){
				var obj = {
					userid: this.userid,
					username: this.username,
					content: content
				};
				this.socket.emit('message', obj);
				$("#content").val('');
			}
			
			return false;
		},
		//聚焦 表情弹层
        /*replace:function(content){
            var res = content;
          
			if (res && res.indexOf('<img') > -1) {
				for (var i = 0; i < 46; i++) {
					if (res.indexOf('<img') > -1) {
						 var reg = RegExp('\\[' + face[i] + '\\]', 'g');
						 res = res.replace(reg, '<img src="img/images/face_' + (i >= 9 ? (i + 1) : ('0' + (i + 1))) + '.png">');
					}
				}
			}
			return res;
		},*/
        
        ejs:function(){
            $("#bqing").css({"display":"block"});
            $("#input-box").css({"bottom":"100px"});
            
            return;
          
        },
       
		genUid:function(){
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},
		//更新系统消息，本例中在用户加入、退出的时候调用
		updateSysMsg:function(o, action){
			//当前在线用户列表
			var onlineUsers = o.onlineUsers;
			//当前在线人数
			var onlineCount = o.onlineCount;
			//新加入用户的信息
			var user = o.user;
				
			//更新在线人数
			var userhtml = '';
			var separator = '';
			for(key in onlineUsers) {
		        if(onlineUsers.hasOwnProperty(key)){
					userhtml += separator+onlineUsers[key];
					separator = '、';
				}
		    }
			d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
			
			//添加系统消息
			var html = '';
			html += '<div class="msg-system">';
			html += user.username;
			html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
			html += '</div>';
			var section = d.createElement('section');
			section.className = 'system';
			section.innerHTML = html;
			this.msgObj.appendChild(section);	
			this.scrollToBottom();
		},
		//第一个界面用户提交用户名
		usernameSubmit:function(){
			var username = d.getElementById("username").value;
			if(username != ""){
				$("#username").value = '';
				$("#loginbox").css({"display":"none"});
				$("#chatbox").css({"display":"block"});
				this.init(username);
			}
			return false;
		},
		//私人聊天室
		private:function(){
          var localname=this.username;//当前用户
          var tag = window.event.target || window.event.srcElement;
          var othername=tag.innerHTML;
          //console.log(othername);
           localStorage.setItem("localname",localname);
           localStorage.setItem("othername",othername);
          window.location.href="./private/private.html";
          
		},
		init:function(username){
			/*
			客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
			实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
			*/
			this.userid = this.genUid();
			this.username = username;
			
			d.getElementById("showusername").innerHTML = this.username;
			this.scrollToBottom();
			
			//连接websocket后端服务器
			this.socket = io.connect('http://10.69.5.135:5050/');
			
			//告诉服务器端有用户登录
			this.socket.emit('login', {userid:this.userid, username:this.username});
			
			//监听新用户登录
			this.socket.on('login', function(o){
				CHAT.updateSysMsg(o, 'login');	
			});
			
			//监听用户退出
			this.socket.on('logout', function(o){
				CHAT.updateSysMsg(o, 'logout');
			});
			
			//监听消息发送
			this.socket.on('message', function(obj){
				var isme = (obj.userid == CHAT.userid) ? true : false;
				var contentDiv = '<div>'+obj.content+'</div>';
				var usernameDiv = '<span class="servername" >'+obj.username+'</span>';
				var usernameDiv2 = '<span calss="servername" onclick="CHAT.private();">'+obj.username+'</span>';
				//var usernameDiv2 = '<a href="./private/private.html"><span>'+obj.username+'</span></a>';
				var section = d.createElement('section');
				if(isme){
					section.className = 'user';
					section.innerHTML = contentDiv + usernameDiv;
				} else {
					section.className = 'service';
					section.innerHTML = usernameDiv2 + contentDiv;
				}
				CHAT.msgObj.appendChild(section);
				CHAT.scrollToBottom();	
			});

		}
	};
	//通过“回车”提交信息
	d.getElementById("content").onkeydown = function(e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.submit();
		}
	};
	$("#bqing").on("click","img",function(){
            	var val=$("#content").val();
            	var imgindex=$(this).index();
            	var faces = new Array('微笑', '色', '亲亲', '得意', '流泪', '害羞', '闭嘴', '鼓掌', '大哭', '尴尬', '生气', '调皮', '呲牙', '惊讶', '委屈', '吐血', '冷汗', '抓狂', '难过', '偷笑', '白眼', '不屑', '快哭了', '困', '装酷', '大笑', '偷瞄', '奋斗', '咒骂', '疑问', '晕', '捶打', '再见', '抠鼻', '发呆', '坏笑', '哈欠','鄙视','睡觉','饿','阴险','难受','可怜','撇嘴','石化','泪眼');
            	var imgname=faces[imgindex];
            	$("#content").val(val+imgname);
            });
        
})();