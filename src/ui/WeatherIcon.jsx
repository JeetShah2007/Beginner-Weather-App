import { WiDaySunny, WiNightClear, WiDayCloudy, WiNightAltCloudy, WiCloudy, WiFog, WiSprinkle, WiRain, WiSnow, WiThunderstorm } from "react-icons/wi";

// picks an icon from the weather code. clear sky falls back to sun/moon
const WeatherIcon = ({ code, day = true, size = 48, className = "" }) => {
  // codes: 1-2 partly cloudy, 3 overcast, 45-48 fog, 51-57 drizzle, 61-67 & 80-82 rain, 71-77 & 85-86 snow, 95+ storm
  let Icon = day ? WiDaySunny : WiNightClear;
  if (code === 1 || code === 2) Icon = day ? WiDayCloudy : WiNightAltCloudy;
  else if (code === 3) Icon = WiCloudy;
  else if (code >= 45 && code <= 48) Icon = WiFog;
  else if (code >= 51 && code <= 57) Icon = WiSprinkle;
  else if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) Icon = WiRain;
  else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) Icon = WiSnow;
  else if (code >= 95) Icon = WiThunderstorm;
  return <Icon size={size} className={className} />;
};

export default WeatherIcon;
