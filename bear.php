<? 
	switch ($_SERVER['HTTP_HOST']) {
		case "www.unitytheory.com":
		case "unitytheory.com":
			$fbAppId = '1466838183600675';
			break;
		case "staging.click3x.com":
		case "click3x.com":
		case "www.click3x.com":
			$fbAppId = '280074545513960';
			$mode = "stage";
			break;
	}
?>

<!DOCTYPE html>
<html>
	<head>
		<link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700&amp;latin" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="http://use.typekit.net/lyz1lsq.js"></script>
		<script type="text/javascript">try{Typekit.load();}catch(e){}</script>
		<link rel='stylesheet' href='bear.css' type='text/css' media='all' />
		 <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		 <script type="text/javascript" src="js/jquery.jplayer.min.js"></script>
		 <script type="text/javascript" src="js/jquery.jplayer.fade.js"></script>
		 <script type="text/javascript" src="js/jquery.animateSprite.min.js"></script>
		 <script src="js/bear.js"></script>

		 <!-- Google Analytics -->
		<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-XXXX-Y', 'auto'); /**add correct GA account info**/
		ga('send', 'pageview');

		</script>
		<!-- End Google Analytics -->

	</head>
	<body class="bear">
		<script>
			<? 
				$url  = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
				$url .= $_SERVER['SERVER_NAME'];
				$url .= $_SERVER['REQUEST_URI']; 
			?>
			var siteRoot = '<?= dirname($url); ?>';
		</script>
		<script>
      window.fbAsyncInit = function() {
        FB.init({
          appId      : <?= $fbAppId ?>,
          version    : 'v2.0'
        });
      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "http://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    </script>


		<div id="blurwrapper">
			<div id="content"></div>
			<div id="nav">
				<ul class="navinner">
					<li class="kitchen"></li>
					<li class="den"></li>
					<li class="bath"></li>
					<li class="sweeps"></li>
				</ul>
			</div>
			<div class='soundon'>Turn Sound On</div>
		</div>
	</body>
</html>