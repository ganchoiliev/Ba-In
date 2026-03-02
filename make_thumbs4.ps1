$ErrorActionPreference = 'Stop'

$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class ThumbMaker {
    public static void MakeHover(string srcPath, string destPath) {
        using (Image src = Image.FromFile(srcPath))
        using (Bitmap bmp = new Bitmap(370, 260))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.Clear(Color.White);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            float scale = Math.Max((float)370 / src.Width, (float)260 / src.Height);
            int wCover = (int)(src.Width * scale);
            int hCover = (int)(src.Height * scale);
            int xCover = (370 - wCover) / 2;
            int yCover = (260 - hCover) / 2;

            g.DrawImage(src, xCover, yCover, wCover, hCover);
            bmp.Save(destPath, ImageFormat.Jpeg);
        }
    }

    public static void MakeThumbRounded(string srcPath, string destPath) {
        using (Image src = Image.FromFile(srcPath))
        using (Bitmap bmp = new Bitmap(370, 209))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.Clear(Color.White);
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            int pad = 20;
            int innerW = 370 - (pad * 2);
            int innerH = 209 - (pad * 2);
            int radius = 15;
            int d = radius * 2;
            Rectangle rect = new Rectangle(pad, pad, innerW, innerH);

            GraphicsPath path = new GraphicsPath();
            path.AddArc(rect.X, rect.Y, d, d, 180, 90);
            path.AddArc(rect.X + rect.Width - d, rect.Y, d, d, 270, 90);
            path.AddArc(rect.X + rect.Width - d, rect.Y + rect.Height - d, d, d, 0, 90);
            path.AddArc(rect.X, rect.Y + rect.Height - d, d, d, 90, 90);
            path.CloseFigure();

            g.SetClip(path);

            float scale = Math.Max((float)innerW / src.Width, (float)innerH / src.Height);
            int wCover = (int)(src.Width * scale);
            int hCover = (int)(src.Height * scale);
            int xCover = pad + (innerW - wCover) / 2;
            int yCover = pad + (innerH - hCover) / 2;

            g.DrawImage(src, xCover, yCover, wCover, hCover);
            g.ResetClip();
            bmp.Save(destPath, ImageFormat.Jpeg);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ThumbMaker]::MakeThumbRounded('C:\Users\ZapEc\.gemini\antigravity\brain\b7223f44-bf89-418c-ab44-faa0b73da211\facial_treatment_hg_1772410054406.png', 'c:\xampp\htdocs\ba-in\assets\images\blog\1-s.jpg')
[ThumbMaker]::MakeHover('C:\Users\ZapEc\.gemini\antigravity\brain\b7223f44-bf89-418c-ab44-faa0b73da211\facial_treatment_hg_1772410054406.png', 'c:\xampp\htdocs\ba-in\assets\images\blog\1.jpg')
Write-Host "Perfect AI generated padded thumbnail and hover images processed!"
